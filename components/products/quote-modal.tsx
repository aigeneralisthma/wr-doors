"use client";

import * as React from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, CheckCircle } from "lucide-react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { whatsappUrl } from "@/lib/constants";

export interface QuoteModalProduct {
  slug: string;
  name_en: string;
  name_ar: string;
}

interface QuoteModalProps {
  product: QuoteModalProduct;
  /** Current locale (en | ar) — used to pick the product name language. */
  locale: string;
}

/**
 * QuoteModal — client-side dialog for requesting a quote on a specific product.
 *
 * Phase 1 (Prompt 4): form submission is stubbed — logs to console and shows
 * a success state. Real Supabase insert + Resend email notification comes in
 * Prompts 7 and 8.
 *
 * The trigger button is a gold BrandButton rendered inside a DialogTrigger.
 * Accessible: DialogTitle and DialogDescription are always present.
 */
export function QuoteModal({ product, locale }: QuoteModalProps) {
  const t = useTranslations("products.quoteModal");

  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const productName = locale === "ar" ? product.name_ar : product.name_en;
  const waUrl = whatsappUrl(
    locale === "ar"
      ? `مرحباً، أنا مهتم بـ ${product.name_ar}`
      : `Hi, I'm interested in the ${product.name_en}`,
  );

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (!v) {
      // Reset form state when dialog closes
      setTimeout(() => setSubmitted(false), 300);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    // Stub — real server action wired in Prompt 8 (Supabase insert + Resend email)
    await new Promise((resolve) => setTimeout(resolve, 900));
    console.log("[Prompt 8 stub] Quote inquiry submitted for product:", product.slug);

    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          {t("title")}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-500" />
            <div>
              <p className="font-serif text-lg font-semibold text-foreground">
                {t("success")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("successBody")}
              </p>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <MessageSquare className="h-4 w-4" />
              {t("whatsappAlt")}
            </a>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product (read-only) */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                {t("productLabel")}
              </Label>
              <Input
                value={productName}
                readOnly
                className="bg-muted text-muted-foreground cursor-default"
                aria-label={t("productLabel")}
              />
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="quote-name" className="mb-1.5 block text-sm font-medium">
                {t("nameLabel")}
              </Label>
              <Input
                id="quote-name"
                name="name"
                required
                minLength={2}
                placeholder={t("namePlaceholder")}
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="quote-phone" className="mb-1.5 block text-sm font-medium">
                {t("phoneLabel")}
              </Label>
              <Input
                id="quote-phone"
                name="phone"
                type="tel"
                required
                placeholder={t("phonePlaceholder")}
                dir="ltr"
              />
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="quote-message" className="mb-1.5 block text-sm font-medium">
                {t("messageLabel")}
              </Label>
              <Textarea
                id="quote-message"
                name="message"
                required
                minLength={10}
                placeholder={t("messagePlaceholder")}
                rows={3}
              />
            </div>

            {/* Submit */}
            <Button type="submit" size="lg" disabled={submitting} className="w-full">
              {submitting ? t("sending") : t("send")}
            </Button>

            {/* WhatsApp alternative */}
            <div className="text-center pt-1">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-[#25D366]"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {t("whatsappAlt")}
              </a>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
