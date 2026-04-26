"use client";

import { motion } from "framer-motion";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { createElement, useMemo, useState } from "react";
import { ClientDateTime } from "@/components/client-datetime";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { GlassCard } from "@/components/glass-card";
import {
  type Transaction,
  useFinance,
} from "@/components/finance-provider";
import { useSettings } from "@/components/settings-provider";
import { formatMoney } from "@/lib/format-money";
import { interpolate, translateCategory } from "@/lib/i18n";
import { getTransactionIconComponent } from "@/lib/transaction-icons";
import { useI18n } from "@/lib/use-i18n";

export function ArchiveView() {
  const {
    archivedTransactions,
    clearArchivedTransactions,
    deleteTransaction,
    restoreTransaction,
  } = useFinance();
  const { locale, currency, use24Hour } = useSettings();
  const { t } = useI18n();
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<Transaction | null>(null);

  const sortedTransactions = useMemo(
    () =>
      [...archivedTransactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [archivedTransactions],
  );

  const countLabel = interpolate(t.archive.countLabel, {
    count: String(sortedTransactions.length),
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="thin-scrollbar flex flex-1 flex-col gap-6 overflow-auto p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              {t.archive.title}
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              {t.archive.subtitle}
            </p>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: sortedTransactions.length === 0 ? 1 : 1.01 }}
            whileTap={{ scale: sortedTransactions.length === 0 ? 1 : 0.99 }}
            onClick={() => setClearConfirmOpen(true)}
            disabled={sortedTransactions.length === 0}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-rose-200/80 px-4 py-2 text-sm font-medium text-rose-600 transition hover:border-rose-300 hover:bg-rose-50/60 disabled:cursor-not-allowed disabled:opacity-45 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            {t.archive.clearAll}
          </motion.button>
        </div>

        <GlassCard className="border-zinc-200/80 bg-white/65 p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <Archive className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {t.archive.summary}
              </p>
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                {countLabel}
              </p>
            </div>
          </div>
        </GlassCard>

        {sortedTransactions.length === 0 ? (
          <GlassCard className="flex min-h-[280px] items-center justify-center border-dashed border-zinc-200/90 bg-white/60 p-10 text-center shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/45">
            <div className="max-w-sm">
              <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                {t.archive.empty}
              </p>
            </div>
          </GlassCard>
        ) : (
          <div className="grid gap-4 xl:[grid-template-columns:repeat(2,minmax(0,1fr))]">
            {sortedTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.28 }}
                className="min-w-0"
              >
                <GlassCard className="h-full border-zinc-200/80 bg-white/68 p-6 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/48">
                  <div className="grid h-full min-w-0 gap-5 [grid-template-columns:minmax(0,1fr)]">
                    <div className="flex min-w-0 items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2 text-xs uppercase tracking-[0.22em] text-zinc-400 dark:text-zinc-500">
                          {createElement(getTransactionIconComponent(transaction.icon), {
                            className: "h-3.5 w-3.5 shrink-0",
                          })}
                          <span className="truncate">{translateCategory(t, transaction.category)}</span>
                        </div>
                        <h2 className="mt-3 truncate text-xl font-medium tracking-tight text-zinc-950 dark:text-zinc-50">
                          {transaction.description}
                        </h2>
                      </div>
                      <p
                        className={`shrink-0 pl-3 text-lg font-semibold tabular-nums ${
                          transaction.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-zinc-900 dark:text-zinc-100"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatMoney(transaction.amount, locale, currency)}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <ClientDateTime
                        isoDate={transaction.date}
                        use24Hour={use24Hour}
                        locale={locale}
                        className="block"
                      />
                      <p>{t.archive.archivedOn}</p>
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPendingRestore(transaction)}
                        className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-zinc-200/90 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100/80 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800/70"
                      >
                        <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
                        {t.archive.restore}
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => deleteTransaction(transaction.id)}
                        className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-rose-200/80 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50/70 dark:border-rose-900/60 dark:text-rose-300 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        {t.archive.delete}
                      </motion.button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <ConfirmationDialog
        open={clearConfirmOpen}
        title={t.archive.confirmDeleteAllTitle}
        body={t.archive.confirmDeleteAllBody}
        confirmLabel={t.common.confirm}
        cancelLabel={t.common.cancel}
        closeLabel={t.common.close}
        icon={Trash2}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={() => {
          clearArchivedTransactions();
          setClearConfirmOpen(false);
        }}
      />

      <ConfirmationDialog
        open={pendingRestore !== null}
        title={t.archive.confirmRestoreTitle}
        body={t.archive.confirmRestoreBody}
        confirmLabel={t.common.confirm}
        cancelLabel={t.common.cancel}
        closeLabel={t.common.close}
        icon={RotateCcw}
        onClose={() => setPendingRestore(null)}
        onConfirm={() => {
          if (!pendingRestore) return;
          restoreTransaction(pendingRestore.id);
          setPendingRestore(null);
        }}
      />
    </>
  );
}
