/**
 * Shared email layout — WR Doors × DODA branded shell.
 *
 * Used by all customer + admin templates. Defines header, footer, and the
 * color palette consistent with the website (gold #F5B800 + navy #0A1F44).
 *
 * Note: React Email components render to inline-styled HTML that works in
 * even the most stubborn email clients (Outlook, Gmail mobile, etc.).
 */

import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import type { ReactNode } from "react";

/** Brand color tokens — duplicated from globals.css for email-renderer use. */
const BRAND = {
  gold: "#F5B800",
  navy: "#0A1F44",
  cream: "#FAF8F1",
  bodyText: "#1a1a1a",
  mutedText: "#666666",
  borderColor: "#E5E5E5",
};

/** Image URLs in emails must be absolute. Falls back to localhost in dev. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface EmailLayoutProps {
  /** Browser preview text (the snippet shown in the inbox list view) */
  preview: string;
  /** "ltr" for EN, "rtl" for AR */
  dir?: "ltr" | "rtl";
  children: ReactNode;
}

export function EmailLayout({ preview, dir = "ltr", children }: EmailLayoutProps) {
  return (
    <Html dir={dir} lang={dir === "rtl" ? "ar" : "en"}>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#F4F4F5",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: BRAND.bodyText,
          direction: dir,
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            margin: "32px auto",
            padding: 0,
            maxWidth: "600px",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(10, 31, 68, 0.06)",
          }}
        >
          {/* Header: navy bar with WR Doors wordmark + DODA microtext */}
          <Section
            style={{
              backgroundColor: BRAND.navy,
              padding: "24px 32px",
              color: "#ffffff",
            }}
          >
            <Text
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: BRAND.gold,
              }}
            >
              WR DOORS
            </Text>
            <Text
              style={{
                margin: "2px 0 0 0",
                fontSize: "10px",
                letterSpacing: "0.2em",
                opacity: 0.65,
                textTransform: "uppercase",
              }}
            >
              Powered by DODA
            </Text>
          </Section>

          {/* Main content area */}
          <Section style={{ padding: "32px" }}>{children}</Section>

          {/* Footer */}
          <Hr style={{ border: "none", borderTop: `1px solid ${BRAND.borderColor}`, margin: 0 }} />
          <Section style={{ padding: "20px 32px", backgroundColor: BRAND.cream }}>
            <Text
              style={{
                margin: "0 0 8px 0",
                fontSize: "12px",
                color: BRAND.mutedText,
                lineHeight: "1.5",
              }}
            >
              <Link
                href={`tel:+971554039966`}
                style={{ color: BRAND.navy, textDecoration: "none", fontWeight: 600 }}
              >
                +971 55 403 9966
              </Link>
              {"  ·  "}
              <Link
                href={`mailto:wahatalruman36@gmail.com`}
                style={{ color: BRAND.navy, textDecoration: "none", fontWeight: 600 }}
              >
                wahatalruman36@gmail.com
              </Link>
              {"  ·  "}
              <Link
                href={SITE_URL}
                style={{ color: BRAND.navy, textDecoration: "none", fontWeight: 600 }}
              >
                wrdoors.com
              </Link>
            </Text>
            <Text
              style={{
                margin: 0,
                fontSize: "11px",
                color: BRAND.mutedText,
                lineHeight: "1.5",
              }}
            >
              {dir === "rtl"
                ? "علامة وَر دورز جزء من منصة دودا · واحة الرمان لتجارة الأبواب ذ.م.م"
                : "WR Doors is a DODA platform brand · Wahat Al Ruman Doors Trading LLC"}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/** Gold accent line — used between heading and body in customer templates. */
export function GoldAccent() {
  return (
    <div
      style={{
        width: "40px",
        height: "3px",
        backgroundColor: BRAND.gold,
        margin: "16px 0",
      }}
    />
  );
}

/** Branded heading (serif-feel, navy). */
export function Heading({ children, dir = "ltr" }: { children: ReactNode; dir?: "ltr" | "rtl" }) {
  return (
    <Text
      style={{
        margin: 0,
        fontSize: "24px",
        fontWeight: 700,
        color: BRAND.navy,
        lineHeight: "1.3",
        textAlign: dir === "rtl" ? "right" : "left",
      }}
    >
      {children}
    </Text>
  );
}

/** Brand color tokens re-exported for use in individual templates. */
export { BRAND };
