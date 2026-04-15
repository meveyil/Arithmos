"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useSettings } from "@/components/settings-provider";
import { APP_NAME } from "@/config/app";
import {
  currencyByLocale,
  currencyLabels,
  interpolate,
  localeLabels,
  type AppCurrency,
  type AppLocale,
} from "@/lib/i18n";
import { useI18n } from "@/lib/use-i18n";

export function OnboardingModal() {
  const { completeOnboarding, setLocale: setGlobalLocale } = useSettings();
  const { t } = useI18n();
  const [locale, setLocale] = useState<AppLocale>("en");
  const [currency, setCurrency] = useState<AppCurrency>(currencyByLocale.en);

  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const welcomeTitle = interpolate(t.onboarding.welcome, { appName: APP_NAME });

  // ✅ Запрещаем закрытие по Escape — онбординг обязателен
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setLangOpen(false);
        setCurrencyOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-md"
      style={{ transform: "translateZ(0)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        // Изменено: bg-white/80 и dark:bg-zinc-900/80 + backdrop-blur для эффекта стекла
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/80"
        style={{ transform: "translateZ(0)", willChange: "opacity, transform" }}
      >
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {welcomeTitle}
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t.onboarding.subtitle}
        </p>

        {/* Язык */}
        <div className="relative mt-5 z-100">
          <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t.onboarding.language}
          </span>
          <button
            type="button"
            onClick={() => { setLangOpen(!langOpen); setCurrencyOpen(false); }}
            className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white/50 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800/50"
          >
            <span>{String(localeLabels[locale])}</span>
            <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${langOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-110" onClick={() => setLangOpen(false)} />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  style={{ transform: "translateZ(0)", willChange: "opacity" }}
                  className="absolute left-0 right-0 z-120 mt-2 max-h-60 overflow-auto rounded-xl border border-zinc-200 bg-white/90 shadow-lg backdrop-blur-lg dark:border-zinc-700 dark:bg-zinc-900/90"
                >
                  {Object.entries(localeLabels).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        const nextLocale = value as AppLocale;
                        setLocale(nextLocale);
                        setGlobalLocale(nextLocale);
                        setCurrency(currencyByLocale[nextLocale]);
                        setLangOpen(false);
                      }}
                      className={`flex w-full px-4 py-3 text-sm transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 ${
                        locale === value ? "bg-zinc-100/80 font-medium dark:bg-zinc-800/80" : ""
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

        {/* Валюта */}
        <div className="relative mt-4 z-90">
          <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t.onboarding.currency}
          </span>
          <button
            type="button"
            onClick={() => { setCurrencyOpen(!currencyOpen); setLangOpen(false); }}
            className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white/50 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800/50"
          >
            <span>{String(currencyLabels[locale === "ru" ? "ru" : "en"]?.[currency] || currency)}</span>
            <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${currencyOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {currencyOpen && (
              <>
                <div className="fixed inset-0 z-110" onClick={() => setCurrencyOpen(false)} />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  style={{ transform: "translateZ(0)", willChange: "opacity" }}
                  className="absolute left-0 right-0 z-120 mt-2 max-h-60 overflow-auto rounded-xl border border-zinc-200 bg-white/90 shadow-lg backdrop-blur-lg dark:border-zinc-700 dark:bg-zinc-900/90"
                >
                  {Object.entries(currencyLabels[locale === "ru" ? "ru" : "en"]).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setCurrency(value as AppCurrency);
                        setCurrencyOpen(false);
                      }}
                      className={`flex w-full px-4 py-3 text-sm transition-colors hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 ${
                        currency === value ? "bg-zinc-100/80 font-medium dark:bg-zinc-800/80" : ""
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

        <button
          type="button"
          onClick={() => completeOnboarding(locale, currency)}
          className="mt-6 w-full rounded-xl bg-zinc-900/90 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-zinc-800 dark:bg-white/90 dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          {t.onboarding.continue}
        </button>
      </motion.div>
    </div>
  );
}