"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Calendar, X } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { IconPickerGrid } from "@/components/icon-picker-grid";
import type { Transaction } from "@/components/finance-provider";
import type { TransactionTemplate } from "@/components/settings-provider";
import { useSettings } from "@/components/settings-provider";
import { CATEGORY_OTHER, normalizeCategoryKey } from "@/lib/category-keys";
import { toDatetimeLocalValue } from "@/lib/datetime-local";
import { formatMoney } from "@/lib/format-money";
import type { AppLocale, Messages } from "@/lib/i18n";
import { interpolate, translateDefaultTemplateName } from "@/lib/i18n";
import { useI18n } from "@/lib/use-i18n";

function templateChipLabel(template: TransactionTemplate, messages: Messages): string {
  const localized = translateDefaultTemplateName(template.id, messages);
  return localized ?? template.name;
}

function formatDateDisplay(
  dtLocalValue: string,
  locale: AppLocale,
  use24Hour: boolean,
): string {
  if (!dtLocalValue) return "";
  try {
    const d = new Date(dtLocalValue);
    if (isNaN(d.getTime())) return dtLocalValue;
    return d.toLocaleString(locale === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: !use24Hour,
    });
  } catch {
    return dtLocalValue;
  }
}

export function AddTransactionModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (t: Omit<Transaction, "id">) => void;
}) {
  const { use24Hour, templates, locale, currency } = useSettings();
  const { t } = useI18n();
  const amountRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [icon, setIcon] = useState("Tag");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState(() => toDatetimeLocalValue(new Date()));

  const dateDisplay = useMemo(
    () => formatDateDisplay(date, locale, use24Hour),
    [date, locale, use24Hour],
  );

  const applyTemplate = useCallback(
    (template: TransactionTemplate) => {
      setDescription(templateChipLabel(template, t));
      setCategory(template.category);
      setIcon(template.icon);
      setType(template.type);
      setDate(toDatetimeLocalValue(new Date()));
      if (template.amount != null && template.amount > 0) {
        setAmount(String(template.amount));
      } else {
        setAmount("");
      }
      requestAnimationFrame(() => {
        amountRef.current?.focus();
      });
    },
    [t],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const n = parseFloat(amount.replace(",", "."));
      if (!description.trim() || Number.isNaN(n) || n <= 0) return;
      const catRaw = category.trim();
      const cat = catRaw
        ? normalizeCategoryKey(catRaw)
        : CATEGORY_OTHER;
      onAdd({
        description: description.trim(),
        category: cat,
        icon: icon || "Tag",
        amount: n,
        type,
        date: new Date(date).toISOString(),
      });
      setDescription("");
      setCategory("");
      setIcon("Tag");
      setAmount("");
      setType("expense");
      setDate(toDatetimeLocalValue(new Date()));
      onClose();
    },
    [amount, category, date, description, icon, onAdd, onClose, type],
  );

  const templateHintText = interpolate(t.addTransaction.templateHint, {
    hourMode: use24Hour
      ? t.addTransaction.hourMode24
      : t.addTransaction.hourMode12,
  });

  return (
    <AnimatePresence>
      {open && (
    <motion.div
    key="add-transaction-modal"
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    style={{ transform: "translateZ(0)", willChange: "opacity" }}
  >
          <motion.button
            type="button"
            aria-label={t.addTransaction.close}
            className="absolute inset-0 bg-zinc-900/20 dark:bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            style={{ willChange: "opacity, transform" }}
          >
            <GlassCard className="thin-scrollbar max-h-[90vh] overflow-y-auto border-zinc-200/90 p-6 shadow-xl dark:border-zinc-700/90">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {t.addTransaction.title}
                </h2>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </motion.button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <span className="mb-2 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {t.addTransaction.quickTemplates}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((tpl) => (
                      <motion.button
                        key={tpl.id}
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => applyTemplate(tpl)}
                        className="rounded-full border border-zinc-200/90 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-zinc-700 shadow-sm shadow-zinc-900/5 transition hover:border-zinc-300 hover:bg-white/90 dark:border-zinc-600/80 dark:bg-zinc-900/50 dark:text-zinc-200 dark:shadow-black/20 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/60"
                      >
                        {templateChipLabel(tpl, t)}
                        {tpl.amount != null && tpl.amount > 0
                          ? ` · ${formatMoney(tpl.amount, locale, currency)}`
                          : ""}
                      </motion.button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
                    {templateHintText}
                  </p>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {t.addTransaction.description}
                  </span>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white/80 px-3 py-2.5 text-sm outline-none ring-violet-500/30 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900/50"
                    placeholder={t.addTransaction.descriptionPlaceholder}
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {t.addTransaction.category}
                  </span>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white/80 px-3 py-2.5 text-sm outline-none ring-violet-500/30 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900/50"
                    placeholder={t.addTransaction.categoryPlaceholder}
                  />
                </label>

                <div>
                  <span className="mb-2 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {t.addTransaction.icon}
                  </span>
                  <IconPickerGrid value={icon} onChange={setIcon} />
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {t.addTransaction.amount}
                  </span>
                  <input
                    ref={amountRef}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="text"
                    inputMode="decimal"
                    className="w-full rounded-xl border border-zinc-200 bg-white/80 px-3 py-2.5 text-sm tabular-nums outline-none ring-violet-500/30 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900/50"
                    placeholder="0"
                  />
                </label>

                <div>
                  <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {t.addTransaction.type}
                  </span>
                  <div className="flex gap-2">
                    {(
                      [
                        ["expense", t.addTransaction.typeExpense],
                        ["income", t.addTransaction.typeIncome],
                      ] as const
                    ).map(([v, label]) => (
                      <motion.button
                        key={v}
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setType(v)}
                        className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${
                          type === v
                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                            : "border-zinc-200 bg-white/60 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300"
                        }`}
                      >
                        {label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
  <span className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
    {t.addTransaction.datetime}
  </span>
  
  <div 
    className="relative group" 
    onClick={() => dateInputRef.current?.showPicker()} 
  >
    <div
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-white/80 px-3 py-2.5 text-sm transition group-hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900/50 dark:group-hover:border-zinc-600 pointer-events-none"
      aria-hidden
    >
      <Calendar
        className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500"
        strokeWidth={1.75}
      />
      <span className="min-w-0 flex-1 truncate tabular-nums text-zinc-800 dark:text-zinc-200">
        {dateDisplay}
      </span>
    </div>

    <input
      ref={dateInputRef}
      type="datetime-local"
      value={date}
      onChange={(e) => setDate(e.target.value)}
      className="absolute inset-0 cursor-pointer opacity-[0.01]"
    />
  </div>
</div>

                <div className="mt-2 flex gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                  >
                    {t.addTransaction.cancel}
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                  >
                    {t.addTransaction.submit}
                  </motion.button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
