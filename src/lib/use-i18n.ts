"use client";

import { useMemo } from "react";
import { useSettings } from "@/components/settings-provider";
import { getMessages, type AppLocale, type Messages } from "@/lib/i18n";

export function useI18n(): { t: Messages; locale: AppLocale } {
  const { locale } = useSettings();
  const t = useMemo(() => getMessages(locale), [locale]);
  return { t, locale };
}
