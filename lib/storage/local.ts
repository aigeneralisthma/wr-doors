import "server-only";

/**
 * Local-filesystem image storage — replaces Supabase Storage.
 *
 * Admin-uploaded product/project images are written under
 * `public/uploads/<bucket>/<slug>/<uuid>.webp` and served by Next as
 * static files at `/uploads/...`. On a persistent-disk host (Hostinger,
 * a VPS) the folder survives deploys; it must NOT be wiped by the deploy
 * step. It is gitignored.
 *
 * Every upload is re-encoded to WebP via Sharp and capped at 2000px on the
 * long edge, so a phone photo doesn't land on disk at 8 MB. If Sharp fails
 * for any reason the original bytes are written unchanged.
 *
 * Seeded products use local manifest paths (`/assets/...`), not `/uploads/`.
 * `deleteFileByUrl` silently ignores anything that isn't an upload URL.
 */

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

/** Bucket = top-level folder under public/uploads. Kept from the Supabase era. */
export const STORAGE_BUCKETS = [
  "products",
  "projects",
  "homepage",
  "services",
  "misc",
] as const;
export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

const MAX_EDGE_PX = 2000;

/** Absolute path to the uploads root. Override with UPLOADS_DIR. */
const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(process.cwd(), "public", "uploads");

/** URL prefix the files are served under. Override with NEXT_PUBLIC_UPLOADS_BASE_URL. */
const BASE_URL = (
  process.env.NEXT_PUBLIC_UPLOADS_BASE_URL ?? "/uploads"
).replace(/\/$/, "");

const SLUG_RE = /^[a-z0-9-]+$/;

export interface UploadResult {
  ok: boolean;
  /** Public URL (only when ok) */
  url?: string;
  /** Path within the uploads root, e.g. "products/foo/uuid.webp" (for delete) */
  path?: string;
  error?: string;
}

/**
 * Upload one image. Path: `<bucket>/<slug>/<uuid>.webp`.
 */
export async function uploadFile(opts: {
  bucket: StorageBucket;
  /** Owner slug (product/project slug) — becomes the folder */
  slug: string;
  file: File;
}): Promise<UploadResult> {
  if (!STORAGE_BUCKETS.includes(opts.bucket)) {
    return { ok: false, error: `Unknown bucket: ${opts.bucket}` };
  }
  if (!SLUG_RE.test(opts.slug)) {
    return { ok: false, error: "Invalid slug." };
  }
  if (opts.file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: `File too large (${Math.round(opts.file.size / 1024 / 1024)} MB). Max is 5 MB.`,
    };
  }
  if (
    !ALLOWED_MIME_TYPES.includes(
      opts.file.type as (typeof ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return {
      ok: false,
      error: `Unsupported file type: ${opts.file.type}. Use JPG, PNG, WebP, or AVIF.`,
    };
  }

  const input = Buffer.from(await opts.file.arrayBuffer());

  let output: Uint8Array = input;
  try {
    output = await sharp(input)
      .rotate() // honor EXIF orientation
      .resize(MAX_EDGE_PX, MAX_EDGE_PX, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
  } catch (err) {
    console.warn("[storage.local] sharp failed, writing original bytes", err);
  }

  const filename = `${randomUUID()}.webp`;
  const relPath = path.posix.join(opts.bucket, opts.slug, filename);
  // Path components are validated above: bucket ∈ STORAGE_BUCKETS, slug matches
  // SLUG_RE, filename is a random UUID. No caller-controlled traversal is possible.
  const absDir = path.join(UPLOADS_DIR, opts.bucket, opts.slug);

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- validated path, see above
    await mkdir(absDir, { recursive: true });
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- validated path, see above
    await writeFile(path.join(absDir, filename), output);
  } catch (err) {
    console.error("[storage.local] write failed", err);
    return { ok: false, error: "Could not save the file." };
  }

  return { ok: true, url: `${BASE_URL}/${relPath}`, path: relPath };
}

/** Extract the path relative to the uploads root, or null if not an upload URL. */
function relPathFromUrl(url: string): string | null {
  const marker = `${BASE_URL}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  const rel = url.slice(i + marker.length).split(/[?#]/)[0];
  return rel || null;
}

/** True if the URL points at our uploads store (vs a local manifest asset). */
export function isUploadUrl(url: string): boolean {
  return relPathFromUrl(url) !== null;
}

/**
 * Delete one file by its public URL. No-ops (ok) for non-upload URLs and
 * for files that are already gone.
 */
export async function deleteFileByUrl(
  url: string,
): Promise<{ ok: boolean; error?: string }> {
  const rel = relPathFromUrl(url);
  if (!rel) return { ok: true }; // manifest asset or external — nothing to do

  const target = path.resolve(UPLOADS_DIR, rel);
  if (
    target !== UPLOADS_DIR &&
    !target.startsWith(UPLOADS_DIR + path.sep)
  ) {
    return { ok: false, error: "Refusing to delete outside the uploads root." };
  }

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- target is resolved and confined to UPLOADS_DIR above
    await unlink(target);
    return { ok: true };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return { ok: true };
    console.error("[storage.local] unlink failed", err);
    return { ok: false, error: "Could not delete the file." };
  }
}

/** Bulk delete — best effort, used when an entire product/project is removed. */
export async function deleteFilesByUrl(urls: string[]): Promise<void> {
  await Promise.allSettled(urls.map((u) => deleteFileByUrl(u)));
}
