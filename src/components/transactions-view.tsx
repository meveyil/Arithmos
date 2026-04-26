"use client";

import { motion } from "framer-motion";
import { Archive, Plus, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { AddTransactionModal } from "@/components/add-transaction-modal";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { GlassCard } from "@/components/glass-card";
import {
  TransactionListRow,
} from "@/components/transaction-list-row";
import {
  type Transaction,
  useFinance,
} from "@/components/finance-provider";
import { useSettings } from "@/components/settings-provider";
import { normalizeCategoryKey } from "@/lib/category-keys";
import { translateCategory } from "@/lib/i18n";
import { useI18n } from "@/lib/use-i18n";

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

type TypeFilter = "all" | "income" | "expense";
type SortMode = "dateDesc" | "dateAsc" | "amountDesc" | "amountAsc";

export function TransactionsView() {
  const {
    activeTransactions,
    addTransaction,
    archiveTransaction,
    deleteTransaction,
  } = useFinance();
  const { use24Hour } = useSettings();
  const { t } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("dateDesc");
  const [pendingArchive, setPendingArchive] = useState<Transaction | null>(null);

  const handleDelete = useCallback(
    (id: string) => {
      deleteTransaction(id);
    },
    [deleteTransaction],
  );

  const handleArchiveRequest = useCallback((id: string) => {
    setPendingArchive(
      activeTransactions.find((transaction) => transaction.id === id) ?? null,
    );
  }, [activeTransactions]);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = activeTransactions.filter((tr) => {
      if (typeFilter === "income" && tr.type !== "income") return false;
      if (typeFilter === "expense" && tr.type !== "expense") return false;
      if (!q) return true;
      const catKey = normalizeCategoryKey(tr.category);
      const catLabel = translateCategory(t, catKey).toLowerCase();
      return (
        tr.description.toLowerCase().includes(q) ||
        tr.category.toLowerCase().includes(q) ||
        catLabel.includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      switch (sortMode) {
        case "dateAsc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "dateDesc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "amountAsc":
          return a.amount - b.amount;
        case "amountDesc":
          return b.amount - a.amount;
        default:
          return 0;
      }
    });

    return list;
  }, [activeTransactions, search, typeFilter, sortMode, t]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="thin-scrollbar flex flex-1 flex-col gap-4 overflow-auto p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {t.transactions.title}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {t.transactions.subtitle}
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-zinc-900/20 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:shadow-black/15 dark:hover:bg-zinc-100"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            {t.transactions.add}
          </motion.button>
        </div>

        <GlassCard className="flex flex-col gap-3 p-4 shadow-md sm:flex-row sm:flex-wrap sm:items-center">
          <label className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.transactions.searchPlaceholder}
              className="w-full rounded-xl border border-zinc-200/90 bg-white/70 py-2.5 pl-10 pr-3 text-sm outline-none ring-violet-500/20 backdrop-blur-sm transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900/40"
            />
          </label>
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-0.5 dark:border-zinc-700 dark:bg-zinc-900/50">
            {(
              [
                ["all", t.transactions.filterAll],
                ["income", t.transactions.filterIncome],
                ["expense", t.transactions.filterExpense],
              ] as const
            ).map(([v, label]) => (
              <motion.button
                key={v}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTypeFilter(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  typeFilter === v
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
                }`}
              >
                {label}
              </motion.button>
            ))}
          </div>
          <div className="flex min-w-[200px] items-center gap-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {t.transactions.sortLabel}
            </span>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="flex-1 rounded-xl border border-zinc-200/90 bg-white/70 px-3 py-2 text-xs font-medium backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/40"
            >
              <option value="dateDesc">{t.transactions.sortDateDesc}</option>
              <option value="dateAsc">{t.transactions.sortDateAsc}</option>
              <option value="amountDesc">{t.transactions.sortAmountDesc}</option>
              <option value="amountAsc">{t.transactions.sortAmountAsc}</option>
            </select>
          </div>
        </GlassCard>

        <GlassCard className="overflow-hidden shadow-md">
          <div className="border-b border-zinc-200/80 px-5 py-3 dark:border-zinc-700/80">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t.transactions.history} ({filteredSorted.length})
            </p>
          </div>
          <motion.ul
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="thin-scrollbar max-h-[min(60vh,520px)] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800/80"
          >
            {filteredSorted.map((tr) => (
              <TransactionListRow
                key={tr.id}
                transaction={tr}
                use24Hour={use24Hour}
                onArchive={handleArchiveRequest}
                onDelete={handleDelete}
              />
            ))}
          </motion.ul>
          {filteredSorted.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {t.transactions.empty}
            </p>
          )}
        </GlassCard>
      </motion.div>

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={addTransaction}
      />
      <ConfirmationDialog
        open={pendingArchive !== null}
        title={t.archive.confirmArchiveTitle}
        body={t.archive.confirmArchiveBody}
        confirmLabel={t.common.confirm}
        cancelLabel={t.common.cancel}
        closeLabel={t.common.close}
        icon={Archive}
        onClose={() => setPendingArchive(null)}
        onConfirm={() => {
          if (!pendingArchive) return;
          archiveTransaction(pendingArchive.id);
          setPendingArchive(null);
        }}
      />
    </>
  );
}
