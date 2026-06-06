#!/usr/bin/env tsx
/**
 * Image optimization pipeline — WR Doors.
 *
 * Reads source images from `Requirments/Assets/<category>/` and produces
 * responsive variants in `public/assets/products/<category-slug>/`:
 *
 *   - 3 sizes: 640w (mobile), 1024w (tablet), 1920w (desktop)
 *   - 3 formats: .avif (best compression), .webp (modern browsers), .jpg (fallback)
 *   - Plus a tiny blurDataURL (10w base64) for next/image placeholders
 *
 * Run with:  pnpm run images
 *
 * Output is git-committed so production deployment doesn't need to re-run
 * the pipeline. Re-run only when source images change.
 */

import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const REQUIREMENTS_ASSETS = path.resolve(PROJECT_ROOT, "../Requirments/Assets");
const OUTPUT_ROOT = path.resolve(PROJECT_ROOT, "public/assets/products");

/** Maps source folder names to URL-safe category slugs */
const CATEGORY_MAP: Record<string, string> = {
  "Premium WPC Doors (Wood Plastic Composite)": "wpc-doors",
  "Luxury Exterior Pivot Aluminium Doors": "pivot-aluminium-doors",
  "Interior Sliding Systems": "sliding-systems",
  "Interior Wall Cladding": "wall-cladding",
  "Factory & Quality Assurance": "factory",
};

const SIZES = [
  { width: 640, label: "640w" },
  { width: 1024, label: "1024w" },
  { width: 1920, label: "1920w" },
] as const;

/** Slugify an image filename: "Modern WPC Interior Door.png" -> "modern-wpc-interior-door" */
function slugify(name: string): string {
  return name
    .replace(/\.[^.]+$/, "") // drop extension
    .replace(/[&]/g, "and")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

/** Produces a 10w base64 placeholder for next/image's blurDataURL */
async function generateBlurDataUrl(input: Buffer): Promise<string> {
  const blurBuffer = await sharp(input)
    .resize(10, 10, { fit: "inside" })
    .webp({ quality: 30 })
    .toBuffer();
  return `data:image/webp;base64,${blurBuffer.toString("base64")}`;
}

interface ImageManifestEntry {
  slug: string;
  category: string;
  sourceName: string;
  blurDataURL: string;
  width: number;
  height: number;
  variants: Array<{
    width: number;
    format: "avif" | "webp" | "jpg";
    path: string;
    bytes: number;
  }>;
}

const manifest: ImageManifestEntry[] = [];
let totalOriginalBytes = 0;
let totalOutputBytes = 0;

async function processImage(
  sourcePath: string,
  categorySlug: string,
  filename: string,
): Promise<void> {
  const slug = slugify(filename);
  const buf = await fs.readFile(sourcePath);
  totalOriginalBytes += buf.byteLength;

  const meta = await sharp(buf).metadata();
  const blurDataURL = await generateBlurDataUrl(buf);

  const outDir = path.join(OUTPUT_ROOT, categorySlug);
  await fs.mkdir(outDir, { recursive: true });

  const variants: ImageManifestEntry["variants"] = [];

  for (const { width } of SIZES) {
    // Don't upscale — skip sizes larger than source
    if (meta.width && width > meta.width) continue;

    const pipeline = sharp(buf).resize(width, undefined, {
      withoutEnlargement: true,
      fit: "inside",
    });

    // AVIF — best compression, modern browsers
    const avifPath = path.join(outDir, `${slug}-${width}.avif`);
    const avifBuf = await pipeline.clone().avif({ quality: 60, effort: 6 }).toBuffer();
    await fs.writeFile(avifPath, avifBuf);
    totalOutputBytes += avifBuf.byteLength;
    variants.push({ width, format: "avif", path: avifPath, bytes: avifBuf.byteLength });

    // WebP — broad modern support
    const webpPath = path.join(outDir, `${slug}-${width}.webp`);
    const webpBuf = await pipeline.clone().webp({ quality: 80, effort: 6 }).toBuffer();
    await fs.writeFile(webpPath, webpBuf);
    totalOutputBytes += webpBuf.byteLength;
    variants.push({ width, format: "webp", path: webpPath, bytes: webpBuf.byteLength });

    // JPG — universal fallback (older browsers / email clients)
    const jpgPath = path.join(outDir, `${slug}-${width}.jpg`);
    const jpgBuf = await pipeline.clone().jpeg({ quality: 82, progressive: true, mozjpeg: true }).toBuffer();
    await fs.writeFile(jpgPath, jpgBuf);
    totalOutputBytes += jpgBuf.byteLength;
    variants.push({ width, format: "jpg", path: jpgPath, bytes: jpgBuf.byteLength });
  }

  manifest.push({
    slug,
    category: categorySlug,
    sourceName: filename,
    blurDataURL,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    variants: variants.map((v) => ({
      ...v,
      // Store path relative to /public for use with next/image
      path: "/" + path.relative(path.join(PROJECT_ROOT, "public"), v.path).replace(/\\/g, "/"),
    })),
  });

  console.log(`  ✓ ${slug} (${variants.length} variants)`);
}

async function main() {
  console.log("\n🖼️  WR Doors image optimization pipeline\n");

  // Verify source directory exists
  try {
    await fs.access(REQUIREMENTS_ASSETS);
  } catch {
    console.error(`✗ Source assets not found at ${REQUIREMENTS_ASSETS}`);
    console.error("  Make sure Requirments/Assets/ exists relative to project root.");
    process.exit(1);
  }

  for (const [sourceFolder, categorySlug] of Object.entries(CATEGORY_MAP)) {
    const sourceDir = path.join(REQUIREMENTS_ASSETS, sourceFolder);
    let entries: string[];
    try {
      entries = await fs.readdir(sourceDir);
    } catch {
      console.log(`  ⊘ ${sourceFolder} — empty or missing, skipping`);
      continue;
    }

    const images = entries.filter((f) =>
      [".png", ".jpg", ".jpeg", ".webp"].includes(path.extname(f).toLowerCase()),
    );

    if (images.length === 0) {
      console.log(`  ⊘ ${sourceFolder} — no images, skipping`);
      continue;
    }

    console.log(`\n📁 ${sourceFolder} → ${categorySlug}/`);
    for (const img of images) {
      await processImage(path.join(sourceDir, img), categorySlug, img);
    }
  }

  // Write manifest as TS module so the app can import strongly-typed image data
  const manifestPath = path.join(PROJECT_ROOT, "lib", "image-manifest.ts");
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });

  const manifestTs = `// AUTO-GENERATED by scripts/optimize-images.ts — do not edit by hand.
// Regenerate with: pnpm run images

export interface OptimizedImage {
  slug: string;
  category: string;
  sourceName: string;
  blurDataURL: string;
  width: number;
  height: number;
  variants: Array<{
    width: number;
    format: "avif" | "webp" | "jpg";
    path: string;
    bytes: number;
  }>;
}

export const IMAGES: OptimizedImage[] = ${JSON.stringify(manifest, null, 2)} as const;

/** Convenience lookup: get an image by category slug + image slug */
export function findImage(category: string, slug: string): OptimizedImage | undefined {
  return IMAGES.find((img) => img.category === category && img.slug === slug);
}

/** All images in a category */
export function imagesByCategory(category: string): OptimizedImage[] {
  return IMAGES.filter((img) => img.category === category);
}

/** For <Image src=...> — picks the best (widest) JPG fallback */
export function bestJpg(img: OptimizedImage): string | undefined {
  const jpg = img.variants.filter((v) => v.format === "jpg").sort((a, b) => b.width - a.width)[0];
  return jpg?.path;
}
`;

  await fs.writeFile(manifestPath, manifestTs);

  // Summary
  const reduction = totalOriginalBytes > 0
    ? Math.round((1 - totalOutputBytes / totalOriginalBytes) * 100)
    : 0;

  console.log("\n📊 Summary");
  console.log(`  Originals:  ${(totalOriginalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Output:     ${(totalOutputBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Reduction:  ${reduction}% (target ~70%, but depends on source quality)`);
  console.log(`  Manifest:   lib/image-manifest.ts (${manifest.length} images)`);
  console.log("\n✅ Done\n");
}

main().catch((err) => {
  console.error("\n✗ Pipeline failed:", err);
  process.exit(1);
});
