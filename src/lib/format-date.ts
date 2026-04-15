import type { AppLocale } from "@/lib/i18n";

const localeTag: Record<AppLocale, string> = {
  en: "en-US",
  ru: "ru-RU",
};

export function formatDateTime(
  isoDate: string,
  use24Hour: boolean,
  appLocale: AppLocale,
): string {
  const d = new Date(isoDate);
  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(use24Hour
      ? { hour: "2-digit", minute: "2-digit", hour12: false }
      : { hour: "numeric", minute: "2-digit", hour12: true }),
  };
  return new Intl.DateTimeFormat(localeTag[appLocale], opts).format(d);
}

export function formatChartAxisDay(
  d: Date,
  appLocale: AppLocale,
): string {
  return new Intl.DateTimeFormat(localeTag[appLocale], {
    day: "numeric",
    month: "short",
  }).format(d);
}

export function formatChartTooltipDate(
  d: Date,
  appLocale: AppLocale,
): string {
  return new Intl.DateTimeFormat(localeTag[appLocale], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
