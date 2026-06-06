import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * BrandButton — opinionated button used on marketing pages.
 *
 * Wraps the base Button with WR Doors signature styling extras:
 *   - `chevron` variant has an angular clipped right edge (flyer geometry)
 *   - Auto arrow icon that flips horizontally for RTL
 *   - Larger default size — marketing CTAs run xl by default
 *
 * `asChild` (inherited from Button via Radix Slot) requires the consumer to
 * pass exactly one React element child. We honor that contract by cloning
 * the child and *injecting* the arrow icon into its own children — that way
 * `<BrandButton asChild><Link>Buy</Link></BrandButton>` renders as
 * `<a>Buy<ArrowRight/></a>` with no extra wrappers that would confuse the
 * accessibility tree or break Tailwind sibling selectors.
 */
const brandButtonVariants = cva("", {
  variants: {
    brand: {
      gold: "",
      navy: "",
      ghost: "",
      chevron:
        "clip-chevron-r rounded-none pe-10 rtl:clip-chevron-l rtl:pe-5 rtl:ps-10",
    },
  },
  defaultVariants: {
    brand: "gold",
  },
});

export interface BrandButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "variant">,
    VariantProps<typeof brandButtonVariants> {
  /** Show the directional arrow icon (forward / back / none). */
  arrow?: "forward" | "back" | "none";
}

function variantClassesFor(brand: BrandButtonProps["brand"]) {
  switch (brand) {
    case "navy":
      return { base: "secondary" as const, extra: "" };
    case "ghost":
      return { base: "ghost" as const, extra: "" };
    case "chevron":
      return { base: "default" as const, extra: "" };
    case "gold":
    default:
      return { base: "default" as const, extra: "" };
  }
}

export const BrandButton = React.forwardRef<HTMLButtonElement, BrandButtonProps>(
  (
    {
      brand = "gold",
      arrow = "forward",
      size = "lg",
      asChild = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { base, extra } = variantClassesFor(brand);

    const ArrowIcon =
      arrow === "forward" ? ArrowRight : arrow === "back" ? ArrowLeft : null;

    const arrowNode = ArrowIcon ? (
      <ArrowIcon key="brand-arrow" className="brand-arrow" />
    ) : null;

    // Compose the final children. When the caller uses `asChild`, Radix Slot
    // requires a single React element. We honor that by injecting the arrow
    // *inside* the wrapped child rather than rendering it as a sibling.
    let content: React.ReactNode;
    if (asChild && React.isValidElement(children)) {
      const childEl = children as React.ReactElement<{
        children?: React.ReactNode;
      }>;
      const merged = (
        <>
          {childEl.props.children}
          {arrowNode}
        </>
      );
      content = React.cloneElement(childEl, undefined, merged);
    } else {
      content = (
        <>
          {children}
          {arrowNode}
        </>
      );
    }

    return (
      <Button
        ref={ref}
        variant={base}
        size={size}
        asChild={asChild}
        className={cn(
          extra,
          brandButtonVariants({ brand }),
          // Arrow icon nudges forward on hover; flips horizontally in RTL.
          "[&_svg.brand-arrow]:transition-transform [&:hover_svg.brand-arrow]:translate-x-0.5 rtl:[&_svg.brand-arrow]:-scale-x-100 rtl:[&:hover_svg.brand-arrow]:-translate-x-0.5",
          className,
        )}
        {...props}
      >
        {content}
      </Button>
    );
  },
);
BrandButton.displayName = "BrandButton";
