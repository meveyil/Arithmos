import type { Transaction } from "@/components/finance-provider";
import type {
  ThemeMode,
  TransactionTemplate,
} from "@/components/settings-provider";
import type { BackupErrorCode } from "@/lib/backup-error-codes";
import type { AppCurrency, AppLocale } from "@/lib/i18n";
import { normalizeCategoryKey } from "@/lib/category-keys";
import { parseTransactionRecord } from "@/lib/parse-transaction";

export type { BackupErrorCode };

export type FinanceBackupV1 = {
  version: number;
  exportedAt?: string;
  settings?: {
    theme?: string;
    locale?: string;
    currency?: string;
    use24Hour?: boolean;
    templates?: unknown[];
    onboardingCompleted?: boolean;
  };
  transactions?: unknown[];
};

export type ValidatedImport = {
  transactions: Transaction[];
  settings: {
    theme?: ThemeMode;
    locale?: AppLocale;
    currency?: AppCurrency;
    use24Hour?: boolean;
    templates?: TransactionTemplate[];
    openAtLogin?: boolean;
    onboardingCompleted?: boolean;
  };
};


function parseTemplateRow(raw: unknown): TransactionTemplate | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.name !== "string") return null;
  if (o.type !== "income" && o.type !== "expense") return null;
  if (typeof o.category !== "string" || typeof o.icon !== "string") return null;
  const amount =
    typeof o.amount === "number" && o.amount > 0 ? o.amount : undefined;
  return {
    id: o.id,
    name: o.name,
    type: o.type,
    category: normalizeCategoryKey(o.category),
    icon: o.icon,
    amount,
  };
}

/** Validates backup JSON shape and returns data to apply in the app. */
export function validateFinanceBackup(
  data: unknown,
):
  | { ok: true; data: ValidatedImport }
  | { ok: false; code: BackupErrorCode } {
  if (data === null || typeof data !== "object") {
    return { ok: false, code: "INVALID_JSON" };
  }
  const root = data as Record<string, unknown>;
  const version = root.version;
  if (version !== 1 && version !== "1") {
    return { ok: false, code: "VERSION_EXPECTED" };
  }

  const transactionsRaw = root.transactions;
  if (!Array.isArray(transactionsRaw)) {
    return { ok: false, code: "MISSING_TRANSACTIONS" };
  }

  const transactions: Transaction[] = [];
  for (const row of transactionsRaw) {
    const t = parseTransactionRecord(row);
    if (!t) {
      return { ok: false, code: "BAD_TRANSACTION_ROW" };
    }
    transactions.push(t);
  }

  const settingsOut: ValidatedImport["settings"] = {};
  const settings = root.settings;
  if (settings !== undefined) {
    if (settings === null || typeof settings !== "object") {
      return { ok: false, code: "SETTINGS_NOT_OBJECT" };
    }
    const s = settings as Record<string, unknown>;
    if (s.theme === "light" || s.theme === "dark") {
      settingsOut.theme = s.theme;
    }
    if (s.locale === "en" || s.locale === "ru") {
      settingsOut.locale = s.locale;
    }
    if (
      s.currency === "KZT" ||
      s.currency === "USD" ||
      s.currency === "EUR" ||
      s.currency === "RUB"
    ) {
      settingsOut.currency = s.currency;
    }
    if (typeof s.use24Hour === "boolean") {
      settingsOut.use24Hour = s.use24Hour;
    }
    if (typeof s.openAtLogin === "boolean") {
      settingsOut.openAtLogin = s.openAtLogin;
    }
    if (typeof s.onboardingCompleted === "boolean") {
      settingsOut.onboardingCompleted = s.onboardingCompleted;
    }
    if (s.templates !== undefined) {
      if (!Array.isArray(s.templates)) {
        return { ok: false, code: "TEMPLATES_NOT_ARRAY" };
      }
      const tpls: TransactionTemplate[] = [];
      for (const row of s.templates) {
        const tpl = parseTemplateRow(row);
        if (!tpl) {
          return { ok: false, code: "BAD_TEMPLATE_ROW" };
        }
        tpls.push(tpl);
      }
      settingsOut.templates = tpls;
    }
  }

  return {
    ok: true,
    data: { transactions, settings: settingsOut },
  };
}
