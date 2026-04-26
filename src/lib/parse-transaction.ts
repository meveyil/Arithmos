import type { Transaction } from "@/components/finance-provider";
import { CATEGORY_OTHER, normalizeCategoryKey } from "@/lib/category-keys";

export function parseTransactionRecord(raw: unknown): Transaction | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.id !== "string" ||
    typeof r.date !== "string" ||
    typeof r.description !== "string"
  )
    return null;
  const amount = Number(r.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (r.type !== "income" && r.type !== "expense") return null;
  return {
    id: r.id,
    date: r.date,
    description: r.description,
    amount,
    type: r.type,
    category: normalizeCategoryKey(
      typeof r.category === "string" ? r.category : CATEGORY_OTHER,
    ),
    icon: typeof r.icon === "string" ? r.icon : "Tag",
    isManuallyRestored: r.isManuallyRestored === true,
  };
}
