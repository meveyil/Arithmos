"use client";

import { createElement } from "react";
import { motion } from "framer-motion";
import { PieChart } from "lucide-react";
import { useMemo } from "react";
import { GlassCard } from "@/components/glass-card";
import type { Transaction } from "@/components/finance-provider";
import { useSettings } from "@/components/settings-provider";
import { CATEGORY_OTHER, normalizeCategoryKey } from "@/lib/category-keys";
import { formatMoneyCompact } from "@/lib/format-money";
import { translateCategory } from "@/lib/i18n";
import { getTransactionIconComponent } from "@/lib/transaction-icons";
import { useI18n } from "@/lib/use-i18n";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function localMonthKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function CategoryExpenseRank({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const { locale, currency } = useSettings();
  const { t } = useI18n();

  const { rows, monthLabel, totalExpense } = useMemo(() => {
    const now = new Date();
    const key = localMonthKey(now);
    const monthTitle = new Intl.DateTimeFormat(
      locale === "ru" ? "ru-RU" : "en-US",
      {
        month: "long",
        year: "numeric",
      },
    ).format(now);

    const expenses = transactions.filter((t) => {
      if (t.type !== "expense") return false;
      return localMonthKey(new Date(t.date)) === key;
    });

    const map = new Map<string, { sum: number; icon: string }>();
    for (const tr of expenses) {
      const catKey = normalizeCategoryKey(tr.category?.trim() || CATEGORY_OTHER);
      const prev = map.get(catKey);
      if (prev) prev.sum += tr.amount;
      else map.set(catKey, { sum: tr.amount, icon: tr.icon });
    }

    const total = [...map.values()].reduce((s, x) => s + x.sum, 0);
    const sorted = [...map.entries()]
      .map(([categoryKey, v]) => ({
        categoryKey,
        sum: v.sum,
        icon: v.icon,
        percent: total > 0 ? (v.sum / total) * 100 : 0,
      }))
      .sort((a, b) => b.sum - a.sum)
      .slice(0, 8);

    return {
      rows: sorted,
      monthLabel: monthTitle,
      totalExpense: total,
    };
  }, [transactions, locale]);

  return (
    <GlassCard className="flex h-full min-h-[260px] flex-col p-5 shadow-md">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
          <PieChart className="h-5 w-5 text-rose-600 dark:text-rose-400" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {t.dashboard.categoryRankTitle}
          </p>
          <p className="text-xs text-zinc-500 capitalize dark:text-zinc-400">
            {monthLabel}
            {totalExpense > 0 && (
              <span className="ml-1 tabular-nums">
                · {t.dashboard.categoryRankTotal}{" "}
                {formatMoneyCompact(totalExpense, locale, currency)}
              </span>
            )}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-center text-sm text-zinc-400 dark:text-zinc-500">
          {t.dashboard.categoryRankEmpty}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((row, i) => (
            <li key={row.categoryKey}>
              <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                <span className="flex min-w-0 items-center gap-2 font-medium text-zinc-700 dark:text-zinc-200">
                  {createElement(getTransactionIconComponent(row.icon), {
                    className:
                      "h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-zinc-400",
                  })}
                  <span className="truncate">
                    {translateCategory(t, row.categoryKey)}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">
                  {row.percent.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800/80">
                <motion.div
                  className="h-full rounded-full bg-linear-to-r from-rose-400 to-orange-400 dark:from-rose-500 dark:to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${row.percent}%` }}
                  transition={{
                    duration: 0.55,
                    delay: 0.04 * i,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              </div>
              <p className="mt-1 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                {formatMoneyCompact(row.sum, locale, currency)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
