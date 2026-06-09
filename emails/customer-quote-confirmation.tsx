/**
 * Customer email — sent after a /quote form submission.
 * Bilingual: EN renders LTR, AR renders RTL.
 */
import { Link, Section, Text } from "@react-email/components";

import { BRAND, EmailLayout, GoldAccent, Heading, type EmailContact } from "./_layout";

interface QuoteConfirmationProps {
  name: string;
  /** The product category they asked about (e.g. "WPC Doors") — already locale-resolved */
  productLabel?: string;
  locale: "en" | "ar";
  /** Admin-editable contact info — appears in the email footer */
  contact?: EmailContact;
}

export default function CustomerQuoteConfirmation({
  name,
  productLabel,
  locale,
  contact,
}: QuoteConfirmationProps) {
  const dir = locale === "ar" ? "rtl" : "ltr";

  const copy =
    locale === "ar"
      ? {
          preview: "تم استلام طلب عرض السعر — سنردّ خلال 24 ساعة",
          heading: `مرحباً ${name}،`,
          p1: productLabel
            ? `شكراً لطلبك عرض سعر لـ ${productLabel}. لقد استلمنا طلبك وسنرسل لك تقديراً تفصيلياً خلال 24 ساعة.`
            : "شكراً لطلبك عرض سعر من WR Doors. لقد استلمنا طلبك وسنرسل لك تقديراً تفصيلياً خلال 24 ساعة.",
          p2: "للمناقشة الفورية أو تحديث المتطلبات، تواصل معنا عبر:",
          waLabel: "تحدّث عبر واتساب",
          phoneLabel: "اتصل بنا",
          signoff: "نتطلع لخدمتك،",
          team: "فريق WR Doors",
        }
      : {
          preview: "Your quote request has been received — we'll respond within 24 hours",
          heading: `Hi ${name},`,
          p1: productLabel
            ? `Thank you for your quote request for ${productLabel}. We've received your request and will send you a detailed estimate within 24 hours.`
            : "Thank you for your quote request with WR Doors. We've received it and will send you a detailed estimate within 24 hours.",
          p2: "To discuss right away or update your requirements, reach out via:",
          waLabel: "Chat on WhatsApp",
          phoneLabel: "Call us",
          signoff: "Looking forward to serving you,",
          team: "The WR Doors team",
        };

  return (
    <EmailLayout preview={copy.preview} dir={dir} contact={contact}>
      <Heading dir={dir}>{copy.heading}</Heading>
      <GoldAccent />
      <Text
        style={{
          fontSize: "15px",
          lineHeight: "1.6",
          color: BRAND.bodyText,
          margin: "0 0 16px 0",
          textAlign: dir === "rtl" ? "right" : "left",
        }}
      >
        {copy.p1}
      </Text>
      <Text
        style={{
          fontSize: "15px",
          lineHeight: "1.6",
          color: BRAND.bodyText,
          margin: "0 0 20px 0",
          textAlign: dir === "rtl" ? "right" : "left",
        }}
      >
        {copy.p2}
      </Text>
      <Section style={{ margin: "20px 0", textAlign: dir === "rtl" ? "right" : "left" }}>
        <Link
          href="https://wa.me/971554039966"
          style={{
            display: "inline-block",
            backgroundColor: "#22C55E",
            color: "#ffffff",
            padding: "10px 18px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
            marginInlineEnd: "10px",
          }}
        >
          {copy.waLabel}
        </Link>
        <Link
          href="tel:+971554039966"
          style={{
            display: "inline-block",
            backgroundColor: BRAND.gold,
            color: BRAND.navy,
            padding: "10px 18px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          {copy.phoneLabel}
        </Link>
      </Section>
      <Text
        style={{
          fontSize: "14px",
          color: BRAND.mutedText,
          margin: "24px 0 0 0",
          textAlign: dir === "rtl" ? "right" : "left",
        }}
      >
        {copy.signoff}
        <br />
        <strong style={{ color: BRAND.bodyText }}>{copy.team}</strong>
      </Text>
    </EmailLayout>
  );
}
