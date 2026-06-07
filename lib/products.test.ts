import { describe, it, expect } from "vitest";
import {
  PRODUCTS,
  featuredByCategory,
  productsByCategory,
  localized,
} from "./products";

describe("PRODUCTS catalog", () => {
  it("seeds 8 products across 4 categories", () => {
    expect(PRODUCTS).toHaveLength(8);
    const categories = new Set(PRODUCTS.map((p) => p.category));
    expect(categories).toEqual(
      new Set([
        "wpc-doors",
        "pivot-aluminium-doors",
        "sliding-systems",
        "wall-cladding",
      ]),
    );
  });

  it("every product has both EN and AR fields filled", () => {
    for (const p of PRODUCTS) {
      expect(p.name_en).toBeTruthy();
      expect(p.name_ar).toBeTruthy();
      expect(p.description_en).toBeTruthy();
      expect(p.description_ar).toBeTruthy();
    }
  });

  it("every product has a resolved image with at least 3 variants", () => {
    for (const p of PRODUCTS) {
      expect(p.image).toBeDefined();
      expect(p.image.variants.length).toBeGreaterThanOrEqual(3);
      expect(p.image.blurDataURL.startsWith("data:image/")).toBe(true);
    }
  });

  it("every category has at least one product", () => {
    for (const slug of [
      "wpc-doors",
      "pivot-aluminium-doors",
      "sliding-systems",
      "wall-cladding",
    ] as const) {
      expect(productsByCategory(slug).length).toBeGreaterThan(0);
    }
  });
});

describe("featuredByCategory()", () => {
  it("returns a featured product for each category", () => {
    const featured = featuredByCategory();
    expect(featured["wpc-doors"]?.featured).toBe(true);
    expect(featured["pivot-aluminium-doors"]?.featured).toBe(true);
    expect(featured["sliding-systems"]?.featured).toBe(true);
    expect(featured["wall-cladding"]?.featured).toBe(true);
  });
});

describe("localized()", () => {
  it("returns AR when locale is ar and AR value is non-empty", () => {
    expect(localized("Hello", "مرحبا", "ar")).toBe("مرحبا");
  });

  it("returns EN when locale is en", () => {
    expect(localized("Hello", "مرحبا", "en")).toBe("Hello");
  });

  it("falls back to EN when AR value is missing", () => {
    expect(localized("Hello", "", "ar")).toBe("Hello");
  });

  it("returns EN for an unknown locale (defensive)", () => {
    expect(localized("Hello", "مرحبا", "fr")).toBe("Hello");
  });
});
