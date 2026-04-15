"use client";

import {
  LayoutDashboard,
  LayoutTemplate,
  ListOrdered,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import type { AppSection } from "@/components/sidebar-types";
import { useI18n } from "@/lib/use-i18n";

export type { AppSection } from "@/components/sidebar-types";

export function Sidebar({
  active,
  onSelect,
}: {
  active: AppSection;
  onSelect: (s: AppSection) => void;
}) {
  const { t } = useI18n();

  const items: { id: AppSection; label: string; icon: typeof LayoutDashboard }[] =
    [
      { id: "dashboard", label: t.sidebar.dashboard, icon: LayoutDashboard },
      { id: "transactions", label: t.sidebar.transactions, icon: ListOrdered },
      { id: "templates", label: t.sidebar.templates, icon: LayoutTemplate },
      { id: "settings", label: t.sidebar.settings, icon: Settings },
    ];

  return (
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      className="thin-scrollbar flex w-56 flex-col gap-1 overflow-y-auto border-r border-zinc-200/80 bg-white/50 p-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/40"
    >
      <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {t.sidebar.menu}
      </p>
      {items.map(({ id, label, icon: Icon }, i) => {
        const isOn = active === id;
        return (
          <motion.button
            key={id}
            type="button"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.3 }}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(id)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
              isOn
                ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/15 dark:bg-white dark:text-zinc-900 dark:shadow-black/10"
                : "text-zinc-600 hover:bg-zinc-100/90 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
            {label}
          </motion.button>
        );
      })}
    </motion.aside>
  );
}
