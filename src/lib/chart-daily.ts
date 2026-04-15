import type { Transaction } from "@/components/finance-provider";
import type { AppLocale } from "@/lib/i18n";
import { formatChartAxisDay, formatChartTooltipDate } from "@/lib/format-date";

export type DailyChartPoint = {
  key: string;
  axisLabel: string;
  showOnAxis: boolean;
  tooltipDate: string;
  income: number;
  expense: number;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function buildLast30DaysSeries(
  transactions: Transaction[],
  locale: AppLocale,
): DailyChartPoint[] {
  const today = new Date();
  const days: DailyChartPoint[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - i,
    );
    const key = localDayKey(d);
    const index = 29 - i;

    const axisLabel = formatChartAxisDay(d, locale);

    const tooltipDate = formatChartTooltipDate(d, locale);

    const showOnAxis = index % 5 === 0 || index === 29;

    days.push({
      key,
      axisLabel,
      showOnAxis,
      tooltipDate,
      income: 0,
      expense: 0,
    });
  }

  const byKey = new Map(days.map((p) => [p.key, p]));
  for (const t of transactions) {
    const key = localDayKey(new Date(t.date));
    const row = byKey.get(key);
    if (!row) continue;
    if (t.type === "income") row.income += t.amount;
    else row.expense += t.amount;
  }

  return days;
}
