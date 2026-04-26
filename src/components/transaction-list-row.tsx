"use client";

import { motion } from "framer-motion";
import { Archive, ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";
import { createElement, memo, useCallback } from "react";
import { ClientDateTime } from "@/components/client-datetime";
import type { Transaction } from "@/components/finance-provider";
import { useSettings } from "@/components/settings-provider";
import { formatMoney } from "@/lib/format-money";
import { translateCategory } from "@/lib/i18n";
import { getTransactionIconComponent } from "@/lib/transaction-icons";
import { useI18n } from "@/lib/use-i18n";

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const TransactionListRow = memo(function TransactionListRow({
  transaction: tr,
  use24Hour,
  onArchive,
  onDelete,
}: {
  transaction: Transaction;
  use24Hour: boolean;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { locale, currency } = useSettings();
  const { t } = useI18n();

  const handleDelete = useCallback(() => {
    onDelete(tr.id);
  }, [onDelete, tr.id]);

  const handleArchive = useCallback(() => {
    onArchive(tr.id);
  }, [onArchive, tr.id]);

  return (
    <motion.li
      variants={rowVariants}
      className="flex flex-wrap items-center gap-3 px-5 py-4 sm:gap-4"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          tr.type === "income"
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
        }`}
      >
        {tr.type === "income" ? (
          <ArrowDownLeft className="h-5 w-5" strokeWidth={1.75} />
        ) : (
          <ArrowUpRight className="h-5 w-5" strokeWidth={1.75} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
          {tr.description}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1">
            {createElement(getTransactionIconComponent(tr.icon), {
              className: "h-3 w-3 shrink-0 opacity-80",
            })}
            {translateCategory(t, tr.category)}
          </span>
          <span className="text-zinc-300 dark:text-zinc-600">·</span>
          <ClientDateTime
            isoDate={tr.date}
            use24Hour={use24Hour}
            locale={locale}
            className="inline"
          />
        </div>
      </div>
      <p
        className={`shrink-0 text-sm font-semibold tabular-nums ${
          tr.type === "income"
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-zinc-900 dark:text-zinc-100"
        }`}
      >
        {tr.type === "income" ? "+" : "-"}
        {formatMoney(tr.amount, locale, currency)}
      </p>
      <div className="ml-auto flex shrink-0 items-center gap-1.5 max-sm:w-full max-sm:justify-end">
        <motion.button
          type="button"
          onClick={handleArchive}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-zinc-200/90 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100/90 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800/70"
        >
          <Archive className="h-3.5 w-3.5" strokeWidth={1.75} />
          {t.archive.sendToArchive}
        </motion.button>
        <motion.button
          type="button"
          aria-label={`${t.transactionRow.deleteAria}: ${tr.description}`}
          onClick={handleDelete}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className="shrink-0 rounded-lg p-2 text-zinc-400/70 transition hover:bg-rose-500/10 hover:text-rose-600 dark:text-zinc-500 dark:hover:bg-rose-500/15 dark:hover:text-rose-400"
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        </motion.button>
      </div>
    </motion.li>
  );
});
