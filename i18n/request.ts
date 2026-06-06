import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * Server-side configuration that loads the right messages file for the
 * incoming request. Used by Server Components to fetch translations.
 *
 * If an unknown locale arrives, we fall back to the default (English)
 * — better than 500ing on a probe request.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
