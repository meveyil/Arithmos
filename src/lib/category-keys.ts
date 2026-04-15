
export const CATEGORY_OTHER = "other";

export const KNOWN_CATEGORY_KEYS = new Set([
  "other",
  "salary",
  "food",
  "transport",
  "housing",
  "income",
]);

const LEGACY_LABEL_TO_KEY: Record<string, string> = {
  Прочее: "other",
  Продукты: "food",
  Транспорт: "transport",
  Жильё: "housing",
  Доход: "income",
  Зарплата: "salary",
  Еда: "food",
  Аренда: "housing",
  Other: "other",
  Food: "food",
  Transport: "transport",
  Housing: "housing",
  Income: "income",
  Salary: "salary",
  Rent: "housing",
};

export function normalizeCategoryKey(raw: unknown): string {
  if (typeof raw !== "string") return CATEGORY_OTHER;
  const s = raw.trim();
  if (!s) return CATEGORY_OTHER;
  if (KNOWN_CATEGORY_KEYS.has(s)) return s;
  const mapped = LEGACY_LABEL_TO_KEY[s];
  if (mapped) return mapped;
  return s;
}
