/**
 * Customer email — sent after a /book consultation booking submission.
 * Bilingual: EN renders LTR, AR renders RTL.
 */
import { Link, Section, Text } from "@react-email/components";

import { BRAND, EmailLayout, GoldAccent, Heading, type EmailContact } from "./_layout";

interface BookingConfirmationProps {
  name: string;
  /** Service type label, already locale-resolved (e.g. "Free Consultation") */
  serviceLabel: string;
  /** ISO date "YYYY-MM-DD" from booking form */
  preferredDate: string;
  /** Area / emirate from booking form */
  area: string;
  locale: "en" | "ar";
  /** Admin-editable contact info — appears in the email footer */
  contact?: EmailContact;
}

export default function CustomerBookingConfirmation({
  name,
  serviceLabel,
  preferredDate,
  area,
  locale,
  contact,
}: BookingConfirmationProps) {
  const dir = locale === "ar" ? "rtl" : "ltr";

  // Format date in the user's locale (e.g. "Saturday, 7 June 2026" / "السبت، 7 يونيو 2026")
  const formattedDate = new Date(preferredDate).toLocaleDateString(
    locale === "ar" ? "ar-AE" : "en-GB",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );

  const copy =
    locale === "ar"
      ? {
          preview: `تم تأكيد طلب الحجز — ${serviceLabel}`,
          heading: `مرحباً ${name}،`,
          p1: `شكراً لحجز ${serviceLabel} مع WR Doors. لقد استلمنا طلبك.`,
          detailsLabel: "تفاصيل طلبك:",
          serviceRow: "الخدمة",
          dateRow: "التاريخ المفضّل",
          areaRow: "المنطقة",
          p2: "سيتواصل معك أحد أفراد الفريق خلال 24 ساعة لتأكيد الموعد. للأمور العاجلة:",
          waLabel: "تحدّث عبر واتساب",
          phoneLabel: "اتصل بنا",
          signoff: "نتطلع لزيارتك،",
          team: "فريق WR Doors",
        }
      : {
          preview: `Your booking request is in — ${serviceLabel}`,
          heading: `Hi ${name},`,
          p1: `Thanks for booking a ${serviceLabel} with WR Doors. We've received your request.`,
          detailsLabel: "Your request details:",
          serviceRow: "Service",
          dateRow: "Preferred date",
          areaRow: "Area",
          p2: "A member of our team will contact you within 24 hours to confirm the appointment. For urgent matters:",
          waLabel: "Chat on WhatsApp",
          phoneLabel: "Call us",
          signoff: "Looking forward to meeting you,",
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
          margin: "0 0 20px 0",
          textAlign: dir === "rtl" ? "right" : "left",
        }}
      >
        {copy.p1}
      </Text>

      {/* Details box (navy left border) */}
      <Section
        style={{
          backgroundColor: BRAND.cream,
          borderInlineStart: `3px solid ${BRAND.gold}`,
          padding: "16px 20px",
          margin: "20px 0",
          borderRadius: "4px",
        }}
      >
        <Text
          style={{
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: BRAND.navy,
            margin: "0 0 10px 0",
            textAlign: dir === "rtl" ? "right" : "left",
          }}
        >
          {copy.detailsLabel}
        </Text>
        <Text
          style={{
            fontSize: "14px",
            lineHeight: "1.8",
            color: BRAND.bodyText,
            margin: 0,
            textAlign: dir === "rtl" ? "right" : "left",
          }}
        >
          <strong>{copy.serviceRow}:</strong> {serviceLabel}
          <br />
          <strong>{copy.dateRow}:</strong> {formattedDate}
          <br />
          <strong>{copy.areaRow}:</strong> {area}
        </Text>
      </Section>

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
