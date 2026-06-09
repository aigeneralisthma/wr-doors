/**
 * Customer email — sent after a /contact form submission.
 * Bilingual: EN renders LTR, AR renders RTL.
 */
import { Link, Section, Text } from "@react-email/components";

import { BRAND, EmailLayout, GoldAccent, Heading, type EmailContact } from "./_layout";

interface ContactConfirmationProps {
  /** Customer's name as submitted */
  name: string;
  /** Their submission locale */
  locale: "en" | "ar";
  /** Admin-editable contact info — appears in the email footer */
  contact?: EmailContact;
}

export default function CustomerContactConfirmation({
  name,
  locale,
  contact,
}: ContactConfirmationProps) {
  const dir = locale === "ar" ? "rtl" : "ltr";

  const copy =
    locale === "ar"
      ? {
          preview: "تم استلام رسالتك — سنردّ خلال 24 ساعة",
          heading: `مرحباً ${name}،`,
          p1: "شكراً لتواصلك مع WR Doors. لقد استلمنا رسالتك وسيتواصل معك فريقنا خلال 24 ساعة.",
          p2: "للأمور العاجلة، يمكنك مراسلتنا مباشرة عبر واتساب أو الاتصال بنا:",
          waLabel: "تحدّث عبر واتساب",
          phoneLabel: "اتصل بنا",
          signoff: "نتطلع للحديث معك،",
          team: "فريق WR Doors",
        }
      : {
          preview: "Your message has been received — we'll respond within 24 hours",
          heading: `Hi ${name},`,
          p1: "Thank you for reaching out to WR Doors. We've received your message and a member of our team will get back to you within 24 hours.",
          p2: "For urgent matters, message us on WhatsApp or give us a call:",
          waLabel: "Chat on WhatsApp",
          phoneLabel: "Call us",
          signoff: "Looking forward to talking with you,",
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
