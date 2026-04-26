"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFinance } from "@/components/finance-provider";
import { useSettings } from "@/components/settings-provider";
import { buildLast30DaysSeries, type DailyChartPoint } from "@/lib/chart-daily";
import { formatMoneyCompact } from "@/lib/format-money";
import { useI18n } from "@/lib/use-i18n";

export function SpendingChart() {
  const { activeTransactions } = useFinance();
  const { locale, currency } = useSettings();
  const { t } = useI18n();
  const data = useMemo(
    () => buildLast30DaysSeries(activeTransactions, locale),
    [activeTransactions, locale],
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
        <defs>
          <linearGradient id="expFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(129, 140, 248)" />
            <stop offset="100%" stopColor="rgb(167, 139, 250)" />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 6"
          vertical={false}
          className="stroke-zinc-200 dark:stroke-zinc-700"
        />
        <XAxis
          dataKey="key"
          type="category"
          axisLine={false}
          tickLine={false}
          interval={0}
          height={36}
          tick={(props) => {
            const { x = 0, y = 0, payload, index } = props as {
              x?: number;
              y?: number;
              payload?: { value?: string };
              index?: number;
            };
            const idx =
              typeof index === "number"
                ? index
                : data.findIndex((d) => d.key === payload?.value);
            const row = idx >= 0 ? data[idx] : undefined;
            if (!row?.showOnAxis) {
              return <g />;
            }
            return (
              <text
                x={x}
                y={y + 12}
                textAnchor="middle"
                fill="#a1a1aa"
                fontSize={10}
              >
                {row.axisLabel}
              </text>
            );
          }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#a1a1aa" }}
          width={40}
        />
        <Tooltip
          cursor={{
            stroke: "rgb(161 161 170)",
            strokeWidth: 1,
            strokeDasharray: "4 4",
          }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const row = payload[0]?.payload as DailyChartPoint | undefined;
            if (!row) return null;
            return (
              <div className="rounded-xl border border-zinc-200/80 bg-white/85 px-3.5 py-2.5 text-xs shadow-lg shadow-zinc-900/10 backdrop-blur-xl dark:border-zinc-600/80 dark:bg-zinc-900/85 dark:shadow-black/40">
                <p className="mb-2 font-semibold text-zinc-700 dark:text-zinc-200">
                  {row.tooltipDate}
                </p>
                <p className="flex justify-between gap-6 text-zinc-600 dark:text-zinc-300">
                  <span>{t.chart.tooltipIncome}:</span>
                  <span className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatMoneyCompact(row.income, locale, currency)}
                  </span>
                </p>
                <p className="mt-1 flex justify-between gap-6 text-zinc-600 dark:text-zinc-300">
                  <span>{t.chart.tooltipExpense}:</span>
                  <span className="font-medium tabular-nums text-rose-600 dark:text-rose-400">
                    {formatMoneyCompact(row.expense, locale, currency)}
                  </span>
                </p>
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="url(#expStroke)"
          strokeWidth={2.25}
          fill="url(#expFill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: "#6366f1" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
