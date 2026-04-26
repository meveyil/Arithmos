import type { Transaction } from "@/components/finance-provider";

export const ARCHIVE_AFTER_DAYS = 45;
const ARCHIVE_AFTER_MS = ARCHIVE_AFTER_DAYS * 24 * 60 * 60 * 1000;

export function isActive(transaction: Transaction, now = new Date()): boolean {
  if (transaction.isManuallyRestored === true) {
    return true;
  }

  const timestamp = new Date(transaction.date).getTime();
  if (Number.isNaN(timestamp)) {
    return true;
  }

  return now.getTime() - timestamp < ARCHIVE_AFTER_MS;
}

export function getActiveTransactions(
  transactions: Transaction[],
  now = new Date(),
): Transaction[] {
  return transactions.filter((transaction) => isActive(transaction, now));
}

export function getArchivedTransactions(
  transactions: Transaction[],
  now = new Date(),
): Transaction[] {
  return transactions.filter((transaction) => !isActive(transaction, now));
}
