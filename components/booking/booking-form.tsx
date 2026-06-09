"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  Package,
  Palette,
  Wrench,
} from "lucide-react";

import {
  bookingContactSchema,
  type BookingContactData,
  type BookingSubmission,
  type ServiceType,
  SERVICE_TYPES,
} from "@/lib/schemas/booking";
import { submitBooking } from "@/app/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { whatsappUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* ── Service card metadata ─────────────────────────────────────────────── */

const SERVICE_ICON: Record<ServiceType, React.ElementType> = {
  consultation: Calendar,
  installation: Package,
  technician: Wrench,
  custom: Palette,
};

/* ── Sub-components ────────────────────────────────────────────────────── */

function ProgressBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
          "bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)]",
        )}
      >
        1
      </div>
      <div
        className={cn(
          "h-0.5 flex-1 rounded-full transition-colors duration-300",
          step === 2
            ? "bg-[var(--color-brand-gold)]"
            : "bg-[var(--color-brand-gold)]/30",
        )}
      />
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300",
          step === 2
            ? "bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)]"
            : "bg-muted text-muted-foreground",
        )}
      >
        2
      </div>
    </div>
  );
}

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
    ? "مرحباً، أودّ تأكيد موعد استشارتي مع WR Doors"
    : "Hi, I'd like to confirm my consultation appointment with WR Doors";

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
          {t("bookAnother")}
        </button>
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────── */

export function BookingForm({ locale }: { locale: string }) {
  const t = useTranslations("booking");
  const searchParams = useSearchParams();

  // If the user arrived from /services with `?service=<key>`, skip the
  // service-picker step and jump straight to the contact-details step.
  // Guard against stale/invalid params with the SERVICE_TYPES allow-list.
  const preselectedService = (() => {
    const raw = searchParams.get("service");
    return raw && (SERVICE_TYPES as readonly string[]).includes(raw)
      ? (raw as ServiceType)
      : null;
  })();

  const [step, setStep] = useState<1 | 2>(preselectedService ? 2 : 1);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    preselectedService,
  );
  const [serviceError, setServiceError] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<BookingContactData>({
    resolver: zodResolver(bookingContactSchema),
    defaultValues: { name: "", phone: "", area: "", date: "", notes: "", _botField: "" },
  });

  /* ── Step navigation ── */

  const handleNext = () => {
    if (!selectedService) {
      setServiceError(true);
      return;
    }
    setServiceError(false);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    form.clearErrors();
  };

  const handleSubmit = async (data: BookingContactData) => {
    if (!selectedService) return;
    setSubmitting(true);
    setServerError(null);

    const submission: BookingSubmission = { service: selectedService, ...data };
    try {
      const result = await submitBooking({
        data: submission,
        locale: locale === "ar" ? "ar" : "en",
      });
      if (result.ok) {
        setSubmitted(true);
      } else {
        setServerError(result.error ?? t("genericError"));
      }
    } catch (err) {
      console.error("[BookingForm] action threw", err);
      setServerError(t("genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedService(null);
    setServiceError(false);
    setSubmitted(false);
    setServerError(null);
    form.reset();
  };

  /* ── Render ── */

  if (submitted) {
    return (
      <SuccessState locale={locale} t={t} onReset={handleReset} />
    );
  }

  return (
    <div>
      {/* Step indicator */}
      <ProgressBar step={step} />
      <p className="mb-1 font-mono text-xs font-semibold uppercase tracking-widest text-primary">
        {step === 1 ? t("step1Label") : t("step2Label")}
      </p>
      <h2 className="mb-6 font-serif text-2xl font-bold text-foreground">
        {step === 1 ? t("step1Title") : t("step2Title")}
      </h2>

      {/* ── Step 1: Service selection ── */}
      {step === 1 && (
        <div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SERVICE_TYPES.map((svc) => {
              const Icon = SERVICE_ICON[svc];
              const isSelected = selectedService === svc;
              return (
                <button
                  key={svc}
                  type="button"
                  onClick={() => {
                    setSelectedService(svc);
                    setServiceError(false);
                  }}
                  className={cn(
                    "group rounded-xl border-2 p-4 text-start transition-all duration-150",
                    isSelected
                      ? "border-[var(--color-brand-gold)] bg-amber-50"
                      : "border-border bg-card hover:border-[var(--color-brand-gold)]/50 hover:bg-muted/50",
                  )}
                  aria-pressed={isSelected}
                >
                  <div
                    className={cn(
                      "mb-3 flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                      isSelected
                        ? "bg-[var(--color-brand-gold)]"
                        : "bg-muted group-hover:bg-[var(--color-brand-gold)]/20",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isSelected
                          ? "text-[var(--color-brand-navy)]"
                          : "text-muted-foreground",
                      )}
                    />
                  </div>
                  <p className="font-semibold text-sm text-foreground">
                    {t(`services.${svc}`)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t(`serviceDescriptions.${svc}`)}
                  </p>
                </button>
              );
            })}
          </div>

          {serviceError && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {t("noServiceError")}
            </p>
          )}

          <div className="mt-8 flex justify-end">
            <Button
              type="button"
              onClick={handleNext}
              className="gap-2 bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)] hover:bg-[var(--color-brand-gold)]/90"
            >
              {t("next")}
              <ChevronRight className="h-4 w-4 rtl:-scale-x-100" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Contact details ── */}
      {step === 2 && (
        <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
          {/* Selected-service chip — shows what they're booking + a way back */}
          {selectedService && (() => {
            const Icon = SERVICE_ICON[selectedService];
            return (
              <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-[var(--color-brand-gold)]/40 bg-amber-50/60 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-gold)]">
                    <Icon className="h-4 w-4 text-[var(--color-brand-navy)]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      {t("selectedServiceLabel")}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {t(`services.${selectedService}`)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t("changeService")}
                </button>
              </div>
            );
          })()}

          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="bk-name">{t("nameLabel")}</Label>
              <Input
                id="bk-name"
                placeholder={t("namePlaceholder")}
                autoComplete="name"
                aria-invalid={!!form.formState.errors.name}
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive" role="alert">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="bk-phone">{t("phoneLabel")}</Label>
              <Input
                id="bk-phone"
                type="tel"
                dir="ltr"
                placeholder={t("phonePlaceholder")}
                autoComplete="tel"
                aria-invalid={!!form.formState.errors.phone}
                {...form.register("phone")}
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive" role="alert">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            {/* Area */}
            <div className="space-y-1.5">
              <Label htmlFor="bk-area">{t("areaLabel")}</Label>
              <Input
                id="bk-area"
                placeholder={t("areaPlaceholder")}
                aria-invalid={!!form.formState.errors.area}
                {...form.register("area")}
              />
              {form.formState.errors.area && (
                <p className="text-xs text-destructive" role="alert">
                  {form.formState.errors.area.message}
                </p>
              )}
            </div>

            {/* Preferred date */}
            <div className="space-y-1.5">
              <Label htmlFor="bk-date">{t("dateLabel")}</Label>
              <Input
                id="bk-date"
                type="date"
                dir="ltr"
                min={new Date().toISOString().split("T")[0]}
                aria-invalid={!!form.formState.errors.date}
                {...form.register("date")}
              />
              {form.formState.errors.date && (
                <p className="text-xs text-destructive" role="alert">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="bk-notes">
                {t("notesLabel")}{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="bk-notes"
                rows={3}
                placeholder={t("notesPlaceholder")}
                {...form.register("notes")}
              />
            </div>
          </div>

          {/* Honeypot — hidden bot trap */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, width: 0, overflow: "hidden" }}>
            <label htmlFor="bk-bot">Leave this empty</label>
            <input id="bk-bot" type="text" tabIndex={-1} autoComplete="off" {...form.register("_botField")} />
          </div>

          {/* Server error */}
          {serverError && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" />
              {t("back")}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="gap-2 bg-[var(--color-brand-gold)] text-[var(--color-brand-navy)] hover:bg-[var(--color-brand-gold)]/90 disabled:opacity-60"
            >
              {submitting ? t("submitting") : t("submit")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
