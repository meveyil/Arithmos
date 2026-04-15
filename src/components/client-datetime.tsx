"use client";

import { useEffect, useState } from "react";
import type { AppLocale } from "@/lib/i18n";
import { formatDateTime } from "@/lib/format-date";

type Props = {
  isoDate: string;
  use24Hour: boolean;
  locale: AppLocale;
  className?: string;
};

export function ClientDateTime({ isoDate, use24Hour, locale, className }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {mounted ? formatDateTime(isoDate, use24Hour, locale) : "\u00a0"}
    </span>
  );
}
