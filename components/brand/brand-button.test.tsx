import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { BrandButton } from "./brand-button";

/**
 * BrandButton — verifies that brand-specific behavior layers correctly
 * over the base Button (right arrow icon, chevron clip path, etc.).
 */
describe("<BrandButton />", () => {
  it("renders a forward arrow by default", () => {
    const { container } = render(<BrandButton>Get Quote</BrandButton>);
    // Lucide icons render as inline <svg>
    const svg = container.querySelector("svg.brand-arrow");
    expect(svg).not.toBeNull();
  });

  it("hides arrow when arrow='none'", () => {
    const { container } = render(
      <BrandButton arrow="none">No arrow</BrandButton>,
    );
    const svg = container.querySelector("svg.brand-arrow");
    expect(svg).toBeNull();
  });

  it("brand='navy' renders the secondary base variant", () => {
    render(<BrandButton brand="navy">Test</BrandButton>);
    const btn = screen.getByRole("button", { name: /Test/ });
    expect(btn.className).toContain("bg-secondary");
  });

  it("brand='chevron' applies the chevron clip-path class", () => {
    render(<BrandButton brand="chevron">Test</BrandButton>);
    const btn = screen.getByRole("button", { name: /Test/ });
    expect(btn.className).toContain("clip-chevron-r");
  });
});
