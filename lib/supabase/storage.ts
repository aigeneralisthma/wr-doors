import "server-only";

/**
 * Supabase Storage helpers — server-only.
 *
 * Used by admin CRUD pages to upload product/project images.
 * The cookie-based server client carries the admin session, so the
 * `admin_insert_storage` RLS policy (Prompt 9b migration 0003) allows
 * the write. Anonymous callers would get a 403.
 */

import { createClient } from "./server";

/** Buckets defined during Prompt 7 Supabase setup. */
export const STORAGE_BUCKETS = [
  "products",
  "projects",
  "homepage",
  "services",
  "misc",
] as const;
export type StorageBucket = (typeof STORAGE_BUCKETS)[number];

/** What the admin UI accepts. Server-side validates again. */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export interface UploadResult {
  ok: boolean;
  /** Public URL (only when ok = true) */
  url?: string;
  /** Path within the bucket (used for delete later) */
  path?: string;
  error?: string;
}

/**
 * Upload a file to a Supabase Storage bucket.
 *
 * Path convention: `<slug>/<random-id>.<ext>` so each product/project's
 * images are namespaced under its slug. The random ID prevents collisions
 * when uploading the same filename twice.
 */
export async function uploadFile(opts: {
  bucket: StorageBucket;
  /** Owner slug (e.g. product slug or project slug) — becomes the folder */
  slug: string;
  /** Original File object from a form submission */
  file: File;
}): Promise<UploadResult> {
  // Server-side validation (defense in depth — client also validates)
  if (opts.file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error: `File too large (${Math.round(opts.file.size / 1024 / 1024)} MB). Max is 5 MB.`,
    };
  }
  if (!ALLOWED_MIME_TYPES.includes(opts.file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return {
      ok: false,
      error: `Unsupported file type: ${opts.file.type}. Use JPG, PNG, WebP, or AVIF.`,
    };
  }

  const ext = opts.file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const randomId = crypto.randomUUID();
  const path = `${opts.slug}/${randomId}.${ext}`;

  const supabase = await createClient();
  const { error } = await supabase.storage.from(opts.bucket).upload(path, opts.file, {
    cacheControl: "31536000", // 1 year — images are content-addressable via UUID
    upsert: false,
    contentType: opts.file.type,
  });

  if (error) {
    console.error("[storage.uploadFile]", error.message);
    return { ok: false, error: error.message };
  }

  // Build the public URL
  const { data: publicUrl } = supabase.storage
    .from(opts.bucket)
    .getPublicUrl(path);

  return { ok: true, url: publicUrl.publicUrl, path };
}

/**
 * Delete a file by full public URL (extracts bucket + path).
 * Used when admin removes an image from a product's gallery.
 *
 * Pattern: `https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>`
 */
export async function deleteFileByUrl(url: string): Promise<{ ok: boolean; error?: string }> {
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!match) {
    return { ok: false, error: "URL doesn't look like a Supabase Storage URL." };
  }
  const [, bucket, path] = match;

  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error("[storage.deleteFileByUrl]", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Bulk delete — used when admin deletes an entire product/project.
 * Best-effort: logs and continues if any individual delete fails.
 */
export async function deleteFilesByUrl(urls: string[]): Promise<void> {
  await Promise.allSettled(urls.map((u) => deleteFileByUrl(u)));
}

/** Quick check: is this URL a Supabase Storage public URL (vs local manifest path)? */
export function isStorageUrl(url: string): boolean {
  return /\/storage\/v1\/object\/public\//.test(url);
}
