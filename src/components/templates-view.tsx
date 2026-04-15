"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
import { createElement, memo, useCallback, useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { IconPickerGrid } from "@/components/icon-picker-grid";
import type { TransactionTemplate } from "@/components/settings-provider";
import { useSettings } from "@/components/settings-provider";
import { normalizeCategoryKey } from "@/lib/category-keys";
import { formatMoney } from "@/lib/format-money";
import type { Messages } from "@/lib/i18n";
import { translateCategory, translateDefaultTemplateName } from "@/lib/i18n";
import { getTransactionIconComponent } from "@/lib/transaction-icons";
import { useI18n } from "@/lib/use-i18n";

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

function templateTitle(template: TransactionTemplate, messages: Messages) {
  return translateDefaultTemplateName(template.id, messages) ?? template.name;
}

const TemplateListRow = memo(function TemplateListRow({
  template,
  onRemove,
}: {
  template: TransactionTemplate;
  onRemove: (id: string) => void;
}) {
  const { locale, currency } = useSettings();
  const { t } = useI18n();

  const handleRemove = useCallback(() => {
    onRemove(template.id);
  }, [onRemove, template.id]);

  const typeLabel =
    template.type === "income" ? t.templates.typeIncome : t.templates.typeExpense;

  return (
    <motion.li
      variants={rowVariants}
      className="flex items-center justify-between gap-3 px-4 py-3"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60">
          {createElement(getTransactionIconComponent(template.icon), {
            className: "h-5 w-5 text-zinc-600 dark:text-zinc-300",
            strokeWidth: 1.75,
          })}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">
            {templateTitle(template, t)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {typeLabel} · {translateCategory(t, template.category)}
            {template.amount != null && template.amount > 0
              ? ` · ${formatMoney(template.amount, locale, currency)}`
              : ""}
          </p>
        </div>
      </div>
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        aria-label={`${t.templates.deleteAria}: ${templateTitle(template, t)}`}
        onClick={handleRemove}
        className="shrink-0 rounded-lg p-2 text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      </motion.button>
    </motion.li>
  );
});

export function TemplatesView() {
  const { templates, addTemplate, removeTemplate } = useSettings();
  const { t } = useI18n();
  const [createOpen, setCreateOpen] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [icon, setIcon] = useState("Tag");
  const [amount, setAmount] = useState("");

  const resetForm = useCallback(() => {
    setName("");
    setCategory("");
    setType("expense");
    setIcon("Tag");
    setAmount("");
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !category.trim()) return;
      const amt = amount.trim()
        ? parseFloat(amount.replace(",", "."))
        : undefined;
      addTemplate({
        name: name.trim(),
        type,
        category: normalizeCategoryKey(category.trim()),
        icon,
        amount:
          amt !== undefined && Number.isFinite(amt) && amt > 0
            ? amt
            : undefined,
      });
      resetForm();
      setCreateOpen(false);
    },
    [addTemplate, amount, category, icon, name, resetForm, type],
  );

  const handleRemove = useCallback(
    (id: string) => {
      removeTemplate(id);
    },
    [removeTemplate],
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="thin-scrollbar flex flex-1 flex-col gap-4 overflow-auto p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {t.templates.title}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {t.templates.subtitle}
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-md dark:bg-white dark:text-zinc-900"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            {t.templates.create}
          </motion.button>
        </div>

        <GlassCard className="overflow-hidden shadow-md">
          <div className="border-b border-zinc-200/80 px-5 py-3 dark:border-zinc-700/80">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t.templates.listTitle} ({templates.length})
            </p>
          </div>
          <motion.ul
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="thin-scrollbar max-h-[min(60vh,520px)] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800/80"
          >
            {templates.map((tpl) => (
              <TemplateListRow key={tpl.id} template={tpl} onRemove={handleRemove} />
            ))}
          </motion.ul>
          {templates.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-zinc-500">
              {t.templates.empty}
            </p>
          )}
        </GlassCard>
      </motion.div>

      <AnimatePresence>
        {createOpen && (
          <motion.div
            key="create-template"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              type="button"
              aria-label={t.settings.close}
              className="absolute inset-0 bg-zinc-900/25 backdrop-blur-sm dark:bg-black/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                resetForm();
                setCreateOpen(false);
              }}
            />
            <motion.div
              className="relative w-full max-w-md"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              <GlassCard className="thin-scrollbar max-h-[85vh] overflow-y-auto border-zinc-200/90 p-6 shadow-2xl dark:border-zinc-700/90">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {t.templates.newTemplate}
                  </h2>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      resetForm();
                      setCreateOpen(false);
                    }}
                    className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <X className="h-5 w-5" strokeWidth={1.75} />
                  </motion.button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                      {t.templates.name}
                    </span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white/80 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900/50"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                      {t.templates.category}
                    </span>
                    <input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white/80 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900/50"
                      required
                    />
                  </label>
                  <div>
                    <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                      {t.templates.type}
                    </span>
                    <div className="flex gap-2">
                      {(
                        [
                          ["expense", t.templates.typeExpense],
                          ["income", t.templates.typeIncome],
                        ] as const
                      ).map(([v, label]) => (
                        <motion.button
                          key={v}
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setType(v)}
                          className={`flex-1 rounded-xl border py-2 text-sm font-medium ${
                            type === v
                              ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                              : "border-zinc-200 bg-white/60 dark:border-zinc-700 dark:bg-zinc-900/40"
                          }`}
                        >
                          {label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="mb-2 block text-xs font-medium text-zinc-500">
                      {t.templates.icon}
                    </span>
                    <IconPickerGrid value={icon} onChange={setIcon} />
                  </div>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-zinc-500">
                      {t.templates.fixedAmount}
                    </span>
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      inputMode="decimal"
                      placeholder="0"
                      className="w-full rounded-xl border border-zinc-200 bg-white/80 px-3 py-2.5 text-sm tabular-nums dark:border-zinc-700 dark:bg-zinc-900/50"
                    />
                  </label>
                  <div className="flex gap-2 pt-2">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        resetForm();
                        setCreateOpen(false);
                      }}
                      className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium dark:border-zinc-600"
                    >
                      {t.templates.cancel}
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
                    >
                      {t.templates.save}
                    </motion.button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
