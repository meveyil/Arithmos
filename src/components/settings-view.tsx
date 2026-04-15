"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  Download,
  Moon,
  Power,
  Shield,
  Sun,
  Trash2,
  Upload,
  ChevronDown,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { GlassCard } from "@/components/glass-card";
import { useFinance } from "@/components/finance-provider";
import { useSettings } from "@/components/settings-provider";
import { APP_VERSION } from "@/config/app";
import type { BackupErrorCode } from "@/lib/backup-error-codes";
import { validateFinanceBackup } from "@/lib/backup";
import {
  currencyLabels,
  localeLabels,
  translateBackupError,
  type AppCurrency,
  type AppLocale,
} from "@/lib/i18n";
import { useI18n } from "@/lib/use-i18n";

function Toggle({
  on,
  onToggle,
  ariaLabel,
}: {
  on: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={onToggle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.94 }}
      className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors ${
        on ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-zinc-700"
      }`}
    >
      <motion.span
        initial={false}
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={`absolute top-1 left-1 block h-6 w-6 rounded-full shadow-md ${
          on ? "bg-white dark:bg-zinc-900" : "bg-white dark:bg-zinc-200"
        }`}
      />
    </motion.button>
  );
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

type ImportErrorKey = BackupErrorCode | "READ_FILE";

export function SettingsView() {
  const { t } = useI18n();
  const {
    theme,
    setTheme,
    locale,
    setLocale,
    currency,
    setCurrency,
    use24Hour,
    setUse24Hour,
    templates,
    openAtLogin,
    setOpenAtLogin,
    applyImportedSettings,
    onboardingCompleted,
  } = useSettings();
  const { transactions, clearAllTransactions, replaceAllTransactions } =
    useFinance();

  const [clearOpen, setClearOpen] = useState(false);
  const [importError, setImportError] = useState<ImportErrorKey | null>(null);

  // Состояния кастомных выпадающих меню
  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleExportJson = useCallback(() => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: {
        theme,
        locale,
        currency,
        use24Hour,
        templates,
        openAtLogin,
        onboardingCompleted,
      },
      transactions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const now = new Date();
    a.href = url;
    a.download = `arithmos_backup_${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [theme, locale, currency, use24Hour, templates, openAtLogin, onboardingCompleted, transactions]);

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      setImportError(null);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result ?? "");
          const json = JSON.parse(text) as unknown;
          const result = validateFinanceBackup(json);
          if (!result.ok) {
            setImportError(result.code);
            return;
          }
          replaceAllTransactions(result.data.transactions);
          applyImportedSettings(result.data.settings);
        } catch {
          setImportError("READ_FILE");
        }
      };
      reader.readAsText(file);
    },
    [applyImportedSettings, replaceAllTransactions],
  );

  const importErrorText =
    importError === null
      ? null
      : importError === "READ_FILE"
        ? t.settings.importReadError
        : translateBackupError(t, importError);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="thin-scrollbar flex flex-1 flex-col gap-5 overflow-auto p-6"
      >
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.settings.title}
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {t.settings.subtitle}
          </p>
        </div>

        {/* Тема */}
        <GlassCard className="flex items-center justify-between gap-4 p-5 shadow-md">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              {theme === "light" ? (
                <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
              ) : (
                <Moon className="h-5 w-5 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {t.settings.themeTitle}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.settings.themeHint}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 rounded-xl border border-zinc-200/90 bg-zinc-50/90 p-0.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTheme("light")}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                theme === "light"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
              }`}
            >
              {t.settings.themeLight}
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTheme("dark")}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                theme === "dark"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400"
              }`}
            >
              {t.settings.themeDark}
            </motion.button>
          </div>
        </GlassCard>

        {/* Язык и Валюта */}
        <GlassCard className="relative z-30 grid gap-4 p-5 shadow-md sm:grid-cols-2">
          {/* Кастомный селект Языка */}
          <div className="relative">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t.settings.language}
            </span>
            <button
              type="button"
              onClick={() => { setLangOpen(!langOpen); setCurrencyOpen(false); }}
              className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white/50 px-3 py-2.5 text-sm transition-all hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900/40"
            >
              <span>{String(localeLabels[locale])}</span>
              <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    // ✅ backdrop-blur удалён — заменён translateZ(0) + solid bg
                    style={{ transform: "translateZ(0)", willChange: "opacity" }}
                    className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    {Object.entries(localeLabels).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => { setLocale(value as AppLocale); setLangOpen(false); }}
                        className={`flex w-full px-3 py-2.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                          locale === value ? "bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-800/50 dark:text-white" : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {String(label)}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Кастомный селект Валюты */}
          <div className="relative">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t.settings.currency}
            </span>
            <button
              type="button"
              onClick={() => { setCurrencyOpen(!currencyOpen); setLangOpen(false); }}
              className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white/50 px-3 py-2.5 text-sm transition-all hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900/40"
            >
              <span>{String(currencyLabels[locale === "ru" ? "ru" : "en"]?.[currency] || currency)}</span>
              <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {currencyOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCurrencyOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.12 }}
                    // ✅ backdrop-blur удалён — заменён translateZ(0) + solid bg
                    style={{ transform: "translateZ(0)", willChange: "opacity" }}
                    className="absolute z-50 mt-2 rounded-xl border border-zinc-200 bg-white/70 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/70"
                  >
                    {Object.entries(currencyLabels[locale === "ru" ? "ru" : "en"]).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => { setCurrency(value as AppCurrency); setCurrencyOpen(false); }}
                        className={`flex w-full px-3 py-2.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                          currency === value ? "bg-zinc-50 font-medium text-zinc-900 dark:bg-zinc-800/50 dark:text-white" : "text-zinc-600 dark:text-zinc-400"
                        }`}
                      >
                        {String(label)}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* Формат времени */}
        <GlassCard className="flex items-center justify-between gap-4 p-5 shadow-md">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
              <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {t.settings.time24Title}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.settings.time24Example}{" "}
                {use24Hour ? "14:30" : "2:30 PM"}
              </p>
            </div>
          </div>
          <Toggle
            on={use24Hour}
            onToggle={() => setUse24Hour(!use24Hour)}
            ariaLabel={t.settings.time24Toggle}
          />
        </GlassCard>

        {/* Автозапуск */}
        <GlassCard className="flex items-center justify-between gap-4 p-5 shadow-md">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <Power className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {t.settings.openAtLoginTitle}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.settings.openAtLoginHint}
              </p>
            </div>
          </div>
          <Toggle
            on={openAtLogin}
            onToggle={() => setOpenAtLogin(!openAtLogin)}
            ariaLabel={t.settings.openAtLoginToggle}
          />
        </GlassCard>

        {/* Данные и бэкап */}
        <div>
          <p className="mb-2 px-0.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            {t.settings.dataSection}
          </p>
          <GlassCard className="space-y-4 p-5 shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
                <Shield className="h-5 w-5 text-sky-600 dark:text-sky-400" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 text-sm text-zinc-600 dark:text-zinc-300">
                <p>{t.settings.dataBlurb}</p>
              </div>
            </div>
            {importErrorText && (
              <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
                {importErrorText}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleImportFile}
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportJson}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200/90 bg-white/70 px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-100"
              >
                <Download className="h-4 w-4" strokeWidth={1.75} />
                {t.settings.exportJson}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200/90 bg-white/70 px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-100"
              >
                <Upload className="h-4 w-4" strokeWidth={1.75} />
                {t.settings.importJson}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setClearOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200/90 bg-rose-50/80 px-4 py-2.5 text-sm font-medium text-rose-700 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                {t.settings.clearAll}
              </motion.button>
            </div>
            <div className="border-t border-zinc-200/80 pt-3 text-xs text-zinc-500 dark:border-zinc-700/80 dark:text-zinc-400">
              {t.settings.appVersion}:{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-200">
                {APP_VERSION}
              </span>
            </div>
          </GlassCard>
        </div>
      </motion.div>

      {/* Модалка подтверждения очистки */}
      <AnimatePresence>
        {clearOpen && (
          <motion.div
            key="clear-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              type="button"
              aria-label={t.settings.close}
              className="absolute inset-0 bg-zinc-900/30 dark:bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setClearOpen(false)}
            />
            <motion.div
              className="relative w-full max-w-sm"
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              style={{ willChange: "opacity, transform" }}
            >
              <GlassCard className="border-zinc-200/90 p-6 shadow-xl dark:border-zinc-700/90">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {t.settings.clearModalTitle}
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {t.settings.clearModalBody}
                </p>
                <div className="mt-5 flex gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setClearOpen(false)}
                    className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
                  >
                    {t.settings.cancel}
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      clearAllTransactions();
                      setClearOpen(false);
                    }}
                    className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-medium text-white shadow-md dark:bg-rose-500"
                  >
                    {t.settings.delete}
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
