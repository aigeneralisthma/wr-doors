import { describe, it, expect } from "vitest";
import { cn } from "./utils";

/**
 * Sanity test for the `cn` helper. Used everywhere in components, so
 * regressions here cause cascading layout breakage.
 */
describe("cn (class merger)", () => {
  it("merges plain strings", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("drops falsy values", () => {
    expect(cn("px-4", false, null, undefined, "py-2")).toBe("px-4 py-2");
  });

  it("respects Tailwind conflict rules (later wins)", () => {
    // Tailwind merge collapses px-4 + px-8 to px-8 — the whole point of tw-merge.
    expect(cn("px-4 py-2", "px-8")).toBe("py-2 px-8");
  });

  it("handles arrays and objects (clsx semantics)", () => {
    expect(cn(["px-4", { "bg-gold": true, "bg-navy": false }])).toBe(
      "px-4 bg-gold",
    );
  });
});
