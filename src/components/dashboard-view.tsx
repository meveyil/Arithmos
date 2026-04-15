"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { CategoryExpenseRank } from "@/components/category-expense-rank";
import { GlassCard } from "@/components/glass-card";
import { useFinance } from "@/components/finance-provider";
import { useSettings } from "@/components/settings-provider";
import { formatMoneyCompact } from "@/lib/format-money";
import { useI18n } from "@/lib/use-i18n";

function ChartLoading() {
  const { t } = useI18n();
  return (
    <div className="flex h-full items-center justify-center text-xs text-zinc-400">
      {t.dashboard.chartLoading}
    </div>
  );
}

const SpendingChart = dynamic(
  () =>
    import("@/components/spending-chart").then((m) => ({
      default: m.SpendingChart,
    })),
  {
    ssr: false,
    loading: ChartLoading,
  },
);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function DashboardView() {
  const { balance, totalIncome, totalExpense, transactions } = useFinance();
  const { locale, currency } = useSettings();
  const { t } = useI18n();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-1 flex-col gap-6 overflow-auto p-6"
    >
      <motion.div variants={item}>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t.dashboard.title}
        </h1>
        <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
          {t.dashboard.subtitle}
        </p>
      </motion.div>

      <motion.div variants={item}>
        <GlassCard className="relative overflow-hidden p-8 shadow-md shadow-zinc-900/6">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-linear-to-br from-violet-400/20 to-fuchsia-400/10 blur-2xl dark:from-violet-500/15 dark:to-fuchsia-500/10" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900/5 dark:bg-white/10">
              <Wallet className="h-6 w-6 text-zinc-700 dark:text-zinc-200" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {t.dashboard.balance}
              </p>
              <p className="mt-1 text-4xl font-semibold tracking-tight text-zinc-900 tabular-nums dark:text-white">
                {formatMoneyCompact(balance, locale, currency)}
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
        <GlassCard className="flex items-center gap-4 p-5 shadow-md">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t.dashboard.income}
            </p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatMoneyCompact(totalIncome, locale, currency)}
            </p>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4 p-5 shadow-md">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10">
            <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t.dashboard.expense}
            </p>
            <p className="mt-0.5 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
              {formatMoneyCompact(totalExpense, locale, currency)}
            </p>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <GlassCard className="flex flex-col p-5 shadow-md">
          <p className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t.dashboard.chartTitle}
          </p>
          <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
            {t.dashboard.chartHint}
          </p>
          <div className="h-[260px] w-full min-h-[260px] min-w-0 flex-1">
            <SpendingChart />
          </div>
        </GlassCard>
        <CategoryExpenseRank transactions={transactions} />
      </motion.div>
    </motion.div>
  );
}
