/**
 * Admin email — sent when a new booking lands in Supabase.
 * Bookings carry a date — admin needs to act on them quickly. English only.
 */
import { Link, Section, Text } from "@react-email/components";

import { BRAND, EmailLayout, Heading } from "./_layout";

interface AdminBookingAlertProps {
  bookingId: string;
  customerName: string;
  phone: string;
  email?: string | null;
  service: "consultation" | "installation" | "technician" | "custom";
  area: string;
  preferredDate: string; // YYYY-MM-DD
  notes?: string | null;
  customerLocale: "en" | "ar";
}

export default function AdminBookingAlert({
  bookingId,
  customerName,
  phone,
  email,
  service,
  area,
  preferredDate,
  notes,
  customerLocale,
}: AdminBookingAlertProps) {
  const serviceLabel: Record<typeof service, string> = {
    consultation: "Free Consultation",
    installation: "Supply & Installation",
    technician: "On-Demand Technician",
    custom: "Custom Design",
  };

  const formattedDate = new Date(preferredDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const localeLabel = customerLocale === "ar" ? "Arabic 🇸🇦" : "English 🇬🇧";

  return (
    <EmailLayout preview={`New booking: ${serviceLabel[service]} — ${customerName}`}>
      <Heading>New booking: {customerName}</Heading>
      <Text
        style={{
          fontSize: "13px",
          color: BRAND.mutedText,
          margin: "8px 0 24px 0",
        }}
      >
        Reply to the customer in <strong>{localeLabel}</strong>.{" "}
        <strong style={{ color: BRAND.navy }}>Action needed: confirm appointment.</strong>
      </Text>

      <Section
        style={{
          backgroundColor: BRAND.cream,
          padding: "16px 20px",
          margin: "0 0 20px 0",
          borderRadius: "6px",
          border: `1px solid ${BRAND.borderColor}`,
        }}
      >
        <Text
          style={{
            fontSize: "14px",
            lineHeight: "1.8",
            color: BRAND.bodyText,
            margin: 0,
          }}
        >
          <strong>Service:</strong> {serviceLabel[service]}
          <br />
          <strong>Preferred date:</strong>{" "}
          <span style={{ color: BRAND.navy, fontWeight: 700 }}>{formattedDate}</span>
          <br />
          <strong>Area:</strong> {area}
          <br />
          <strong>Customer:</strong> {customerName}
          <br />
          <strong>Phone:</strong>{" "}
          <Link href={`tel:${phone}`} style={{ color: BRAND.navy }}>
            {phone}
          </Link>{" "}
          (
          <Link
            href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
            style={{ color: "#22C55E" }}
          >
            WhatsApp
          </Link>
          )
          {email && (
            <>
              <br />
              <strong>Email:</strong>{" "}
              <Link href={`mailto:${email}`} style={{ color: BRAND.navy }}>
                {email}
              </Link>
            </>
          )}
          <br />
          <strong>Customer locale:</strong> {customerLocale}
          <br />
          <strong>Booking ID:</strong>{" "}
          <code style={{ fontSize: "11px", color: BRAND.mutedText }}>{bookingId}</code>
        </Text>
      </Section>

      {notes && (
        <>
          <Text
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: BRAND.navy,
              margin: "0 0 8px 0",
            }}
          >
            Customer notes
          </Text>
          <Section
            style={{
              backgroundColor: "#ffffff",
              padding: "16px",
              margin: "0 0 16px 0",
              borderLeft: `3px solid ${BRAND.gold}`,
              borderRadius: "0 6px 6px 0",
              direction: customerLocale === "ar" ? "rtl" : "ltr",
            }}
          >
            <Text
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: BRAND.bodyText,
                margin: 0,
                whiteSpace: "pre-wrap",
                textAlign: customerLocale === "ar" ? "right" : "left",
              }}
            >
              {notes}
            </Text>
          </Section>
        </>
      )}

      <Text
        style={{
          fontSize: "12px",
          color: BRAND.mutedText,
          margin: "20px 0 0 0",
          fontStyle: "italic",
        }}
      >
        Booking saved to Supabase. View in dashboard once /admin is live (Prompt 9).
      </Text>
    </EmailLayout>
  );
}
