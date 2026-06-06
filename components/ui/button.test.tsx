import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Button } from "./button";

/**
 * Button — variant + size sanity. We're not duplicating cva's own tests;
 * we just confirm that the public API surface (variant, size, asChild)
 * produces the expected DOM + Tailwind classes so downstream components
 * (BrandButton, etc.) can rely on it.
 */
describe("<Button />", () => {
  it("renders a button by default", () => {
    render(<Button>Submit</Button>);
    const btn = screen.getByRole("button", { name: "Submit" });
    expect(btn.tagName).toBe("BUTTON");
  });

  it("applies the gold (default) variant classes", () => {
    render(<Button>Go</Button>);
    const btn = screen.getByRole("button", { name: "Go" });
    expect(btn.className).toContain("bg-primary");
    expect(btn.className).toContain("text-primary-foreground");
  });

  it("applies the navy (secondary) variant classes", () => {
    render(<Button variant="secondary">Go</Button>);
    const btn = screen.getByRole("button", { name: "Go" });
    expect(btn.className).toContain("bg-secondary");
    expect(btn.className).toContain("text-secondary-foreground");
  });

  it("applies the outline variant classes", () => {
    render(<Button variant="outline">Go</Button>);
    const btn = screen.getByRole("button", { name: "Go" });
    expect(btn.className).toContain("border-2");
    expect(btn.className).toContain("border-secondary");
  });

  it("renders as a child element when asChild is true", () => {
    render(
      <Button asChild>
        {/* External URL keeps next/no-html-link-for-pages happy in tests */}
        <a href="https://example.com">Visit</a>
      </Button>,
    );
    // Should render an <a>, not a <button>
    const link = screen.getByRole("link", { name: "Visit" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
    // But still has the button styling
    expect(link.className).toContain("bg-primary");
  });

  it("size=lg increases padding + height", () => {
    render(<Button size="lg">Big</Button>);
    const btn = screen.getByRole("button", { name: "Big" });
    expect(btn.className).toContain("h-12");
    expect(btn.className).toContain("px-8");
  });
});
