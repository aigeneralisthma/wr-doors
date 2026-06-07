import { z } from "zod";

/**
 * Contact form schema — used by the `/contact` page in Prompt 6.
 * Real submission wired to Supabase + Resend in Prompt 8.
 *
 * Validation rules:
 *   - name: required, 2+ characters
 *   - email: required, valid format
 *   - phone: required, 8+ characters (UAE numbers vary in length when formatted)
 *   - subject: required, 2+ characters
 *   - message: required, 10+ characters
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z
    .string()
    .min(1, "Please enter your email")
    .refine((v) => EMAIL_RE.test(v), {
      message: "Please enter a valid email",
    }),
  phone: z.string().min(8, "Please enter a valid phone number"),
  subject: z.string().min(2, "Please enter a subject"),
  message: z
    .string()
    .min(10, "Please write at least a short message (10 characters)"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
