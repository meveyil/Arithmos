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
import { parseTransactionRecord } from "@/lib/parse-transaction";

const FINANCE_STORAGE_KEY = "arithmos-transactions";

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  /** Lucide icon key (see transaction-icons). */
  icon: string;
};

function migrateTransaction(raw: unknown): Transaction | null {
  return parseTransactionRecord(raw);
}

const seed: Transaction[] = [];

type FinanceCtx = {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  clearAllTransactions: () => void;
  replaceAllTransactions: (next: Transaction[]) => void;
  financeHydrated: boolean;
  balance: number;
  totalIncome: number;
  totalExpense: number;
};

const FinanceContext = createContext<FinanceCtx | null>(null);

function loadStoredTransactions(): Transaction[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FINANCE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const list = parsed
      .map(migrateTransaction)
      .filter((x): x is Transaction => x !== null);
    return list;
  } catch {
    return null;
  }
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(seed);
  const [financeHydrated, setFinanceHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (isElectronFileStorage()) {
        await migrateLegacyLocalStorageToDiskIfNeeded();
        if (cancelled) return;
        const snap = await loadAppDataSnapshot();
        if (cancelled) return;
        if (snap.fileExists && Array.isArray(snap.data.transactions)) {
          const list = snap.data.transactions
            .map(migrateTransaction)
            .filter((x): x is Transaction => x !== null);
          setTransactions(list);
        } else if (!snap.fileExists) {
          const fromLs = loadStoredTransactions();
          if (fromLs !== null) setTransactions(fromLs);
        }
        setFinanceHydrated(true);
        return;
      }
      const stored = loadStoredTransactions();
      if (!cancelled && stored !== null) setTransactions(stored);
      if (!cancelled) setFinanceHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!financeHydrated) return;
    if (isElectronFileStorage()) {
      void persistAppDataPartial({ transactions });
      return;
    }
    localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions, financeHydrated]);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setTransactions((prev) => [
      {
        ...t,
        id: crypto.randomUUID(),
      },
      ...prev,
    ]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  const replaceAllTransactions = useCallback((next: Transaction[]) => {
    setTransactions(next);
  }, []);

  const { balance, totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    return {
      balance: income - expense,
      totalIncome: income,
      totalExpense: expense,
    };
  }, [transactions]);

  const value = useMemo(
    () => ({
      transactions,
      addTransaction,
      deleteTransaction,
      clearAllTransactions,
      replaceAllTransactions,
      financeHydrated,
      balance,
      totalIncome,
      totalExpense,
    }),
    [
      transactions,
      addTransaction,
      deleteTransaction,
      clearAllTransactions,
      replaceAllTransactions,
      financeHydrated,
      balance,
      totalIncome,
      totalExpense,
    ],
  );

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
