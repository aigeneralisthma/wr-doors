"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CheckCircle, MessageCircle } from "lucide-react";

import { contactSchema, type ContactFormData } from "@/lib/schemas/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { whatsappUrl } from "@/lib/constants";

/* ── Field wrapper ─────────────────────────────────────────────────────── */

function Field({
  htmlFor,
  label,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* ── Success state ─────────────────────────────────────────────────────── */

function SuccessState({
  locale,
  t,
  onReset,
}: {
  locale: string;
  t: ReturnType<typeof useTranslations>;
  onReset: () => void;
}) {
  const isAr = locale === "ar";
  const waText = isAr
    ? "مرحباً، أرسلت لكم رسالة عبر الموقع وأودّ المتابعة عبر واتساب"
    : "Hi, I sent a message through the website and would like to follow up on WhatsApp";

  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle className="h-8 w-8 text-emerald-600" />
      </div>
      <h2 className="mb-2 font-serif text-2xl font-bold text-foreground">
        {t("successTitle")}
      </h2>
      <p className="mb-8 max-w-sm text-muted-foreground">{t("successBody")}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsappUrl(waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          {t("whatsappFollowUp")}
        </a>
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
        >
          {t("newRequest")}
        </button>
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────── */

export function ContactForm({ locale }: { locale: string }) {
  const t = useTranslations("contact");

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    console.log("[Prompt 8 stub] Contact form submitted:", data);
    setSubmitting(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    reset();
  };

  if (submitted) {
    return <SuccessState locale={locale} t={t} onReset={handleReset} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Name + Email (2-col on sm+) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          htmlFor="ct-name"
          label={t("nameLabel")}
          error={errors.name?.message}
        >
          <Input
            id="ct-name"
            autoComplete="name"
            placeholder={t("namePlaceholder")}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </Field>
        <Field
          htmlFor="ct-email"
          label={t("emailLabel")}
          error={errors.email?.message}
        >
          <Input
            id="ct-email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>
      </div>

      {/* Phone + Subject (2-col on sm+) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          htmlFor="ct-phone"
          label={t("phoneLabel")}
          error={errors.phone?.message}
        >
          <Input
            id="ct-phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder={t("phonePlaceholder")}
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
        </Field>
        <Field
          htmlFor="ct-subject"
          label={t("subjectLabel")}
          error={errors.subject?.message}
        >
          <Input
            id="ct-subject"
            placeholder={t("subjectPlaceholder")}
            aria-invalid={!!errors.subject}
            {...register("subject")}
          />
        </Field>
      </div>

      {/* Message */}
      <Field
        htmlFor="ct-message"
        label={t("messageLabel")}
        error={errors.message?.message}
      >
        <Textarea
          id="ct-message"
          rows={5}
          placeholder={t("messagePlaceholder")}
          aria-invalid={!!errors.message}
          {...register("message")}
        />
      </Field>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)] hover:bg-[var(--color-brand-gold)]/90 disabled:opacity-60"
      >
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
