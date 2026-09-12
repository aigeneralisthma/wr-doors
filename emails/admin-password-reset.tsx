/**
 * Admin password-reset email. English only (internal tool).
 * Sent by `requestPasswordReset` in app/actions/auth-reset.ts.
 */
import { Button, Text } from "@react-email/components";

import { BRAND, EmailLayout, GoldAccent, Heading, type EmailContact } from "./_layout";

interface AdminPasswordResetProps {
  /** Full reset URL, e.g. https://wrdoors.com/admin/reset-password?token=... */
  resetUrl: string;
  contact?: EmailContact;
}

export default function AdminPasswordReset({
  resetUrl,
  contact,
}: AdminPasswordResetProps) {
  return (
    <EmailLayout preview="Reset your WR Doors admin password" contact={contact}>
      <Heading>Reset your admin password</Heading>
      <GoldAccent />
      <Text style={{ fontSize: "14px", lineHeight: "1.6", color: BRAND.bodyText }}>
        We received a request to reset the password for the WR Doors admin
        account. Click the button below to choose a new one. This link
        expires in <strong>1 hour</strong> and can only be used once.
      </Text>
      <Button
        href={resetUrl}
        style={{
          backgroundColor: BRAND.gold,
          color: BRAND.navy,
          fontWeight: 700,
          fontSize: "14px",
          padding: "12px 28px",
          borderRadius: "8px",
          textDecoration: "none",
          display: "inline-block",
          margin: "20px 0",
        }}
      >
        Choose a new password
      </Button>
      <Text style={{ fontSize: "12px", lineHeight: "1.6", color: BRAND.mutedText }}>
        If the button doesn&apos;t work, paste this link into your browser:
        <br />
        <span style={{ wordBreak: "break-all" }}>{resetUrl}</span>
      </Text>
      <Text style={{ fontSize: "12px", lineHeight: "1.6", color: BRAND.mutedText, marginTop: "20px" }}>
        Didn&apos;t request this? You can safely ignore this email — your
        password won&apos;t change unless the link above is used.
      </Text>
    </EmailLayout>
  );
}
