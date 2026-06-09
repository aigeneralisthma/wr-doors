/**
 * Admin email — sent when a new lead lands in Supabase.
 * Covers both /quote and /contact submissions. English only (internal).
 */
import { Link, Section, Text } from "@react-email/components";

import { BRAND, EmailLayout, Heading, type EmailContact } from "./_layout";

interface AdminLeadAlertProps {
  /** Lead row id (UUID) — for deep-linking to admin dashboard once it exists */
  leadId: string;
  /** Submission source — 'quote' or 'contact' */
  source: "quote" | "contact" | "product-page";
  name: string;
  phone: string;
  email?: string | null;
  subject?: string | null;
  product?: string | null;
  budget?: string | null;
  location?: string | null;
  message: string;
  /** Customer's submission locale — admin needs to know which language to reply in */
  customerLocale: "en" | "ar";
  /** Admin-editable contact info — appears in the email footer */
  contact?: EmailContact;
}

export default function AdminLeadAlert({
  leadId,
  source,
  name,
  phone,
  email,
  subject,
  product,
  budget,
  location,
  message,
  customerLocale,
  contact,
}: AdminLeadAlertProps) {
  const sourceLabel =
    source === "quote"
      ? "Quote request"
      : source === "product-page"
        ? "Product page inquiry"
        : "Contact form";

  const localeLabel = customerLocale === "ar" ? "Arabic 🇸🇦" : "English 🇬🇧";

  return (
    <EmailLayout preview={`New ${source} lead from ${name}`} contact={contact}>
      <Heading>New {sourceLabel.toLowerCase()}: {name}</Heading>
      <Text
        style={{
          fontSize: "13px",
          color: BRAND.mutedText,
          margin: "8px 0 24px 0",
        }}
      >
        Reply to the customer in <strong>{localeLabel}</strong>.
      </Text>

      {/* Details table */}
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
          <strong>Name:</strong> {name}
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
          {subject && (
            <>
              <br />
              <strong>Subject:</strong> {subject}
            </>
          )}
          {product && (
            <>
              <br />
              <strong>Product:</strong> {product}
            </>
          )}
          {budget && (
            <>
              <br />
              <strong>Budget:</strong> {budget}
            </>
          )}
          {location && (
            <>
              <br />
              <strong>Location:</strong> {location}
            </>
          )}
          <br />
          <strong>Source:</strong> {source}
          <br />
          <strong>Customer locale:</strong> {customerLocale}
          <br />
          <strong>Lead ID:</strong>{" "}
          <code style={{ fontSize: "11px", color: BRAND.mutedText }}>{leadId}</code>
        </Text>
      </Section>

      {/* Message body */}
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
        Customer message
      </Text>
      <Section
        style={{
          backgroundColor: "#ffffff",
          padding: "16px",
          margin: "0 0 16px 0",
          borderLeft: `3px solid ${BRAND.gold}`,
          borderRadius: "0 6px 6px 0",
          // Arabic content from /ar form needs RTL display
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
          {message}
        </Text>
      </Section>

      <Text
        style={{
          fontSize: "12px",
          color: BRAND.mutedText,
          margin: "20px 0 0 0",
          fontStyle: "italic",
        }}
      >
        Lead saved to Supabase. View in dashboard once /admin is live (Prompt 9).
      </Text>
    </EmailLayout>
  );
}
