"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  isElectronFileStorage,
  loadAppDataSnapshot,
  migrateLegacyLocalStorageToDiskIfNeeded,
  persistAppDataPartial,
} from "@/lib/electron-app-data";
import { normalizeCategoryKey } from "@/lib/category-keys";
import {
  type AppCurrency,
  type AppLocale,
} from "@/lib/i18n";

export type ThemeMode = "light" | "dark";

export type TransactionTemplate = {
  id: string;
  name: string;
  type: "income" | "expense";
  category: string;
  icon: string;
  amount?: number;
};

export const DEFAULT_TRANSACTION_TEMPLATES: TransactionTemplate[] = [];

type SettingsState = {
  theme: ThemeMode;
  locale: AppLocale;
  currency: AppCurrency;
  onboardingCompleted: boolean;
  settingsHydrated: boolean;
  use24Hour: boolean;
  templates: TransactionTemplate[];
  openAtLogin: boolean;
  setTheme: (t: ThemeMode) => void;
  setLocale: (locale: AppLocale) => void;
  setCurrency: (currency: AppCurrency) => void;
  completeOnboarding: (locale: AppLocale, currency: AppCurrency) => void;
  setUse24Hour: (v: boolean) => void;
  setOpenAtLogin: (v: boolean) => void;
  addTemplate: (t: Omit<TransactionTemplate, "id">) => void;
  removeTemplate: (id: string) => void;
  applyImportedSettings: (partial: {
    theme?: ThemeMode;
    locale?: AppLocale;
    currency?: AppCurrency;
    use24Hour?: boolean;
    templates?: TransactionTemplate[];
    openAtLogin?: boolean;
    onboardingCompleted?: boolean;
  }) => void;
};

const STORAGE_KEY = "arithmos-settings";

const SettingsContext = createContext<SettingsState | null>(null);

function parseTemplates(raw: unknown): TransactionTemplate[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: TransactionTemplate[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.id !== "string" || typeof o.name !== "string") continue;
    if (o.type !== "income" && o.type !== "expense") continue;
    if (typeof o.category !== "string" || typeof o.icon !== "string") continue;
    const amount =
      typeof o.amount === "number" && o.amount > 0 ? o.amount : undefined;
    out.push({
      id: o.id,
      name: o.name,
      type: o.type,
      category: normalizeCategoryKey(o.category),
      icon: o.icon,
      amount,
    });
  }
  return out;
}

function parseSettingsRecord(
  parsed: Record<string, unknown> | null | undefined,
): Partial<{
  theme: ThemeMode;
  locale: AppLocale;
  currency: AppCurrency;
  use24Hour: boolean;
  templates: TransactionTemplate[];
  openAtLogin: boolean;
  onboardingCompleted: boolean;
}> {
  if (!parsed || typeof parsed !== "object") return {};
  const tpl = parseTemplates(parsed.templates);
  return {
    theme: parsed.theme === "dark" || parsed.theme === "light" ? parsed.theme : undefined,
    locale: parsed.locale === "en" || parsed.locale === "ru" ? parsed.locale : undefined,
    currency:
      parsed.currency === "KZT" ||
      parsed.currency === "USD" ||
      parsed.currency === "EUR" ||
      parsed.currency === "RUB"
        ? parsed.currency
        : undefined,
    use24Hour:
      typeof parsed.use24Hour === "boolean" ? parsed.use24Hour : undefined,
    templates: tpl && tpl.length > 0 ? tpl : undefined,
    openAtLogin:
      typeof parsed.openAtLogin === "boolean" ? parsed.openAtLogin : undefined,
    onboardingCompleted:
      typeof parsed.onboardingCompleted === "boolean"
        ? parsed.onboardingCompleted
        : undefined,
  };
}

function readStored(): Partial<{
  theme: ThemeMode;
  locale: AppLocale;
  currency: AppCurrency;
  use24Hour: boolean;
  templates: TransactionTemplate[];
  openAtLogin: boolean;
  onboardingCompleted: boolean;
}> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parseSettingsRecord(parsed);
  } catch {
    return {};
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [locale, setLocaleState] = useState<AppLocale>("en");
  const [currency, setCurrencyState] = useState<AppCurrency>("USD");
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [use24Hour, setUse24HourState] = useState(true);
  const [templates, setTemplatesState] = useState<TransactionTemplate[]>(
    () => [...DEFAULT_TRANSACTION_TEMPLATES],
  );
  const [openAtLogin, setOpenAtLoginState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (isElectronFileStorage()) {
        await migrateLegacyLocalStorageToDiskIfNeeded();
        if (cancelled) return;
        const snap = await loadAppDataSnapshot();
        if (cancelled) return;
        const diskSettings = snap.data.settings;
        if (
          snap.fileExists &&
          diskSettings &&
          typeof diskSettings === "object" &&
          !Array.isArray(diskSettings)
        ) {
          const s = parseSettingsRecord(diskSettings as Record<string, unknown>);
          if (s.theme === "dark" || s.theme === "light") setThemeState(s.theme);
          if (s.locale === "en" || s.locale === "ru") setLocaleState(s.locale);
          if (s.currency) setCurrencyState(s.currency);
          if (typeof s.use24Hour === "boolean") setUse24HourState(s.use24Hour);
          if (s.templates?.length) setTemplatesState(s.templates);
          if (typeof s.openAtLogin === "boolean") {
            setOpenAtLoginState(s.openAtLogin);
          }
          // ✅ ИСПРАВЛЕНИЕ: ?? false (было ?? true).
          // При отсутствии поля в файле — показываем онбординг принудительно,
          // иначе новая установка пропускала его, если файл создавался
          // FinanceProvider раньше первого сохранения настроек.
          setOnboardingCompleted(s.onboardingCompleted ?? false);
        } else if (!snap.fileExists) {
          const s = readStored();
          if (s.theme === "dark" || s.theme === "light") setThemeState(s.theme);
          if (s.locale === "en" || s.locale === "ru") setLocaleState(s.locale);
          if (s.currency) setCurrencyState(s.currency);
          if (typeof s.use24Hour === "boolean") setUse24HourState(s.use24Hour);
          if (s.templates?.length) setTemplatesState(s.templates);
          if (typeof s.openAtLogin === "boolean") {
            setOpenAtLoginState(s.openAtLogin);
          }
          setOnboardingCompleted(s.onboardingCompleted ?? false);
        }
        setHydrated(true);
        return;
      }
      // localStorage path
      const s = readStored();
      if (!cancelled) {
        if (s.theme === "dark" || s.theme === "light") setThemeState(s.theme);
        if (s.locale === "en" || s.locale === "ru") setLocaleState(s.locale);
        if (s.currency) setCurrencyState(s.currency);
        if (typeof s.use24Hour === "boolean") setUse24HourState(s.use24Hour);
        if (s.templates?.length) setTemplatesState(s.templates);
        if (typeof s.openAtLogin === "boolean") {
          setOpenAtLoginState(s.openAtLogin);
        }
        // Если localStorage пуст — s.onboardingCompleted будет undefined → false → показать онбординг
        setOnboardingCompleted(s.onboardingCompleted ?? false);
        setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.lang = locale;
    const payload = {
      theme,
      locale,
      currency,
      use24Hour,
      templates,
      openAtLogin,
      onboardingCompleted,
    };
    if (isElectronFileStorage()) {
      void persistAppDataPartial({ settings: payload });
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [theme, locale, currency, use24Hour, templates, openAtLogin, onboardingCompleted, hydrated]);

  // Синхронизируем openAtLogin с Electron после гидрации
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const api = window.electronAPI;
    if (!api?.getOpenAtLogin) return;
    let cancelled = false;
    void api.getOpenAtLogin().then((v) => {
      if (!cancelled && typeof v === "boolean") setOpenAtLoginState(v);
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  const setTheme = useCallback((t: ThemeMode) => setThemeState(t), []);
  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
  }, []);
  const setCurrency = useCallback((next: AppCurrency) => {
    setCurrencyState(next);
  }, []);
  const completeOnboarding = useCallback((nextLocale: AppLocale, nextCurrency: AppCurrency) => {
    setLocaleState(nextLocale);
    setCurrencyState(nextCurrency);
    setOnboardingCompleted(true);
  }, []);
  const setUse24Hour = useCallback((v: boolean) => setUse24HourState(v), []);

  const setOpenAtLogin = useCallback((v: boolean) => {
    setOpenAtLoginState(v);
    void window.electronAPI?.setOpenAtLogin?.(v);
  }, []);

  const addTemplate = useCallback(
    (t: Omit<TransactionTemplate, "id">) => {
      setTemplatesState((prev) => [
        ...prev,
        { ...t, id: crypto.randomUUID() },
      ]);
    },
    [],
  );

  const removeTemplate = useCallback((id: string) => {
    setTemplatesState((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const applyImportedSettings = useCallback(
    (partial: {
      theme?: ThemeMode;
      locale?: AppLocale;
      currency?: AppCurrency;
      use24Hour?: boolean;
      templates?: TransactionTemplate[];
      openAtLogin?: boolean;
      onboardingCompleted?: boolean;
    }) => {
      if (partial.theme === "light" || partial.theme === "dark") {
        setThemeState(partial.theme);
      }
      if (partial.locale === "en" || partial.locale === "ru") {
        setLocaleState(partial.locale);
      }
      if (partial.currency) {
        setCurrencyState(partial.currency);
      }
      if (typeof partial.use24Hour === "boolean") {
        setUse24HourState(partial.use24Hour);
      }
      if (partial.templates !== undefined) {
        setTemplatesState(partial.templates);
      }
      if (typeof partial.openAtLogin === "boolean") {
        setOpenAtLogin(partial.openAtLogin);
      }
      if (typeof partial.onboardingCompleted === "boolean") {
        setOnboardingCompleted(partial.onboardingCompleted);
      }
    },
    [setOpenAtLogin],
  );

  const value = useMemo(
    () => ({
      theme,
      locale,
      currency,
      onboardingCompleted,
      settingsHydrated: hydrated,
      use24Hour,
      templates,
      openAtLogin,
      setTheme,
      setLocale,
      setCurrency,
      completeOnboarding,
      setUse24Hour,
      setOpenAtLogin,
      addTemplate,
      removeTemplate,
      applyImportedSettings,
    }),
    [
      theme,
      locale,
      currency,
      onboardingCompleted,
      hydrated,
      use24Hour,
      templates,
      openAtLogin,
      setTheme,
      setLocale,
      setCurrency,
      completeOnboarding,
      setUse24Hour,
      setOpenAtLogin,
      addTemplate,
      removeTemplate,
      applyImportedSettings,
    ],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
