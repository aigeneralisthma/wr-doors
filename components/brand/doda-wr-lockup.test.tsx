import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { DodaWrLockup } from "./doda-wr-lockup";

/**
 * DodaWrLockup — verify each variant renders both brand SVGs and the
 * correct aria label so screen readers announce "DODA × WR Doors".
 *
 * Both inner SVGs (WrDoorsLogo + DodaLogo) also expose role="img" — so we
 * query by the specific name to avoid matching multiple elements.
 */
describe("<DodaWrLockup />", () => {
  it("renders both DODA and WR Doors logos as SVG", () => {
    const { container } = render(<DodaWrLockup />);
    const svgs = container.querySelectorAll("svg");
    // 2 brand SVGs (DODA wordmark + WR Doors wordmark with their inner artwork)
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it("exposes the co-brand label for screen readers (default)", () => {
    render(<DodaWrLockup />);
    // Query the wrapper by its specific name to avoid matching inner logo SVGs
    expect(screen.getByRole("img", { name: "DODA × WR Doors" })).toBeInTheDocument();
  });

  it("accepts a custom label", () => {
    render(<DodaWrLockup label="Custom co-brand" />);
    expect(
      screen.getByRole("img", { name: "Custom co-brand" }),
    ).toBeInTheDocument();
  });

  it("header variant uses a horizontal layout", () => {
    const { container } = render(<DodaWrLockup variant="header" />);
    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain("flex");
    expect(wrapper.className).toContain("items-center");
  });

  it("splash variant uses a vertical layout (stacked)", () => {
    const { container } = render(<DodaWrLockup variant="splash" />);
    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain("flex-col");
  });

  it("footer variant uses a horizontal compact layout", () => {
    const { container } = render(<DodaWrLockup variant="footer" />);
    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain("flex");
    expect(wrapper.className).toContain("items-center");
  });
});
