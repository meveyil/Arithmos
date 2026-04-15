import type { AppCurrency, AppLocale } from "@/lib/i18n";

const localeTagByAppLocale: Record<AppLocale, string> = {
  en: "en-US",
  ru: "ru-RU",
};

export function formatMoney(
  n: number,
  locale: AppLocale,
  currency: AppCurrency,
  options?: { maximumFractionDigits?: number },
): string {
  return new Intl.NumberFormat(localeTagByAppLocale[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(n);
}

export function formatMoneyCompact(
  n: number,
  locale: AppLocale,
  currency: AppCurrency,
): string {
  return formatMoney(n, locale, currency, { maximumFractionDigits: 0 });
}
