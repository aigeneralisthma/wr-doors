import { describe, it, expect } from "vitest";
import { BRAND, CONTACT, whatsappUrl, PRODUCT_CATEGORIES } from "./constants";

describe("BRAND constants", () => {
  it("exposes the WR Doors primary brand name", () => {
    expect(BRAND.name).toBe("WR Doors");
  });

  it("exposes DODA as the platform co-brand", () => {
    expect(BRAND.platform).toBe("DODA");
  });

  it("exposes the legal entity (English + Arabic)", () => {
    expect(BRAND.legalName).toContain("Wahat Al Ruman");
    expect(BRAND.legalNameAr).toContain("واحة الرمان");
  });
});

describe("CONTACT constants", () => {
  it("uses the verified UAE phone number", () => {
    expect(CONTACT.phone).toBe("+971 55 403 9966");
    expect(CONTACT.phoneE164).toBe("971554039966");
  });

  it("matches between display and E.164 (no transcription errors)", () => {
    const digitsOnly = CONTACT.phone.replace(/\D/g, "");
    expect(digitsOnly).toBe(CONTACT.phoneE164);
  });

  it("matches the email from the client flyer", () => {
    expect(CONTACT.email).toBe("wahatalruman36@gmail.com");
  });
});

describe("whatsappUrl()", () => {
  it("returns the bare wa.me link when no message provided", () => {
    expect(whatsappUrl()).toBe("https://wa.me/971554039966");
  });

  it("URL-encodes the message correctly", () => {
    const url = whatsappUrl("Hi, I'm interested in WPC doors");
    expect(url).toContain("https://wa.me/971554039966?text=");
    expect(url).toContain("WPC%20doors");
  });

  it("safely handles Arabic messages", () => {
    const url = whatsappUrl("مرحباً، أريد معرفة المزيد");
    expect(url).toContain("%D9%85%D8%B1%D8%AD%D8%A8"); // encoded "مرحب"
  });
});

describe("PRODUCT_CATEGORIES", () => {
  it("exposes the four catalog categories", () => {
    const slugs = PRODUCT_CATEGORIES.map((c) => c.slug);
    expect(slugs).toEqual([
      "wpc-doors",
      "pivot-aluminium-doors",
      "sliding-systems",
      "wall-cladding",
    ]);
  });

  it("each category has an i18n labelKey", () => {
    for (const cat of PRODUCT_CATEGORIES) {
      expect(cat.labelKey).toMatch(/^products\.categories\./);
    }
  });
});
