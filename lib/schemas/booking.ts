import { z } from "zod";

export const SERVICE_TYPES = [
  "consultation",
  "installation",
  "technician",
  "custom",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

/** Contact-details step of the booking form */
export const bookingContactSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  area: z.string().min(2, "Please enter your area or emirate"),
  date: z.string().min(1, "Please select a preferred date"),
  notes: z.string().optional(),
  /** Honeypot — see contact.ts */
  _botField: z.string().optional(),
});

export type BookingContactData = z.infer<typeof bookingContactSchema>;

/** Combined shape submitted to the server action */
export interface BookingSubmission extends BookingContactData {
  service: ServiceType;
}
