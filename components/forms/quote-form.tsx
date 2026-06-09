"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle, MessageCircle, Package, Palette } from "lucide-react";

import {
  quoteSchema,
  type QuoteFormData,
  PRODUCT_OPTIONS,
  BUDGET_OPTIONS,
} from "@/lib/schemas/quote";
import { submitQuoteLead } from "@/app/actions/leads";
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

/* ── Native styled select ──────────────────────────────────────────────── */

function NativeSelect({
  id,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { id: string }) {
  return (
    <select
      id={id}
      className={
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm " +
        "text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 " +
        "disabled:cursor-not-allowed disabled:opacity-50 " +
        (className ?? "")
      }
      {...props}
    />
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
    ? "مرحباً، أودّ الاستفسار عن عرض سعر من WR Doors"
    : "Hi, I'd like to follow up on my quote request with WR Doors";

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

/** Services that can be pre-selected via `?service=<key>` from /services. */
const FROM_SERVICE_ALLOWED = ["installation", "custom"] as const;
type FromServiceKey = (typeof FROM_SERVICE_ALLOWED)[number];

const FROM_SERVICE_ICON: Record<FromServiceKey, React.ElementType> = {
  installation: Package,
  custom: Palette,
};

export function QuoteForm({ locale }: { locale: string }) {
  const t = useTranslations("quote");
  const searchParams = useSearchParams();

  // Read `?service=<key>` if it was passed from the services page.
  // Used to show a small context banner so the user understands which
  // service-card brought them here and the team knows the lead's origin.
  const fromService: FromServiceKey | null = (() => {
    const raw = searchParams.get("service");
    return raw && (FROM_SERVICE_ALLOWED as readonly string[]).includes(raw)
      ? (raw as FromServiceKey)
      : null;
  })();

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      product: "",
      quantity: "",
      name: "",
      phone: "",
      email: "",
      location: "",
      budget: "",
      message: "",
      _botField: "",
    },
  });

  const onSubmit = async (data: QuoteFormData) => {
    setSubmitting(true);
    setServerError(null);
    try {
      const result = await submitQuoteLead({
        data,
        locale: locale === "ar" ? "ar" : "en",
      });
      if (result.ok) {
        setSubmitted(true);
      } else {
        setServerError(result.error ?? t("genericError"));
      }
    } catch (err) {
      console.error("[QuoteForm] action threw", err);
      setServerError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setServerError(null);
    reset();
  };

  if (submitted) {
    return <SuccessState locale={locale} t={t} onReset={handleReset} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Context banner — shown only when the user arrived from a service
          card on /services, so they don't feel like the quote form is
          unrelated to their click. */}
      {fromService && (() => {
        const Icon = FROM_SERVICE_ICON[fromService];
        return (
          <div className="-mt-2 flex items-center gap-3 rounded-xl border border-[var(--color-brand-gold)]/40 bg-amber-50/60 p-3.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-gold)]">
              <Icon className="h-4 w-4 text-[var(--color-brand-navy)]" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {t("fromServiceLabel")}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {t(`fromService.${fromService}`)}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Product category */}
      <Field htmlFor="qt-product" label={t("productLabel")} error={errors.product?.message}>
        <NativeSelect
          id="qt-product"
          aria-invalid={!!errors.product}
          {...register("product")}
        >
          <option value="">{t("productPlaceholder")}</option>
          {PRODUCT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {t(`products.${opt}`)}
            </option>
          ))}
        </NativeSelect>
      </Field>

      {/* Quantity */}
      <Field htmlFor="qt-quantity" label={t("quantityLabel")} error={errors.quantity?.message}>
        <Input
          id="qt-quantity"
          placeholder={t("quantityPlaceholder")}
          aria-invalid={!!errors.quantity}
          {...register("quantity")}
        />
      </Field>

      {/* Name + Phone (2-col on sm+) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field htmlFor="qt-name" label={t("nameLabel")} error={errors.name?.message}>
          <Input
            id="qt-name"
            autoComplete="name"
            placeholder={t("namePlaceholder")}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </Field>
        <Field htmlFor="qt-phone" label={t("phoneLabel")} error={errors.phone?.message}>
          <Input
            id="qt-phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder={t("phonePlaceholder")}
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
        </Field>
      </div>

      {/* Email + Location (2-col on sm+) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field htmlFor="qt-email" label={t("emailLabel")} error={errors.email?.message}>
          <Input
            id="qt-email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>
        <Field htmlFor="qt-location" label={t("locationLabel")} error={errors.location?.message}>
          <Input
            id="qt-location"
            placeholder={t("locationPlaceholder")}
            aria-invalid={!!errors.location}
            {...register("location")}
          />
        </Field>
      </div>

      {/* Budget (optional) */}
      <Field htmlFor="qt-budget" label={t("budgetLabel")} error={errors.budget?.message}>
        <NativeSelect id="qt-budget" {...register("budget")}>
          <option value="">{t("budgetPlaceholder")}</option>
          {BUDGET_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {t(`budgets.${opt}`)}
            </option>
          ))}
        </NativeSelect>
      </Field>

      {/* Message */}
      <Field htmlFor="qt-message" label={t("messageLabel")} error={errors.message?.message}>
        <Textarea
          id="qt-message"
          rows={4}
          placeholder={t("messagePlaceholder")}
          aria-invalid={!!errors.message}
          {...register("message")}
        />
      </Field>

      {/* Honeypot — hidden bot trap */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, width: 0, overflow: "hidden" }}>
        <label htmlFor="qt-bot">Leave this empty</label>
        <input id="qt-bot" type="text" tabIndex={-1} autoComplete="off" {...register("_botField")} />
      </div>

      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

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
