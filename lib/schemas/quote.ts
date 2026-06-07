import { z } from "zod";

export const PRODUCT_OPTIONS = [
  "wpcDoors",
  "pivotDoors",
  "sliding",
  "cladding",
  "other",
] as const;

export type ProductOption = (typeof PRODUCT_OPTIONS)[number];

export const BUDGET_OPTIONS = [
  "under5k",
  "from5k",
  "from15k",
  "over50k",
  "tbd",
] as const;

export type BudgetOption = (typeof BUDGET_OPTIONS)[number];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const quoteSchema = z.object({
  product: z.string().min(1, "Please select a product category"),
  quantity: z.string().min(1, "Please enter an approximate quantity"),
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  /** Optional — empty string is allowed */
  email: z
    .string()
    .refine((v) => v === "" || EMAIL_RE.test(v), {
      message: "Please enter a valid email",
    }),
  location: z.string().min(2, "Please enter your project location"),
  /** Optional budget range */
  budget: z.string().optional(),
  message: z
    .string()
    .min(10, "Please describe your project (at least 10 characters)"),
  /** Honeypot — see contact.ts */
  _botField: z.string().optional(),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;
