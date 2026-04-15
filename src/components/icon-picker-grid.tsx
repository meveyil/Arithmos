"use client";

import { createElement } from "react";
import { motion } from "framer-motion";
import {
  TRANSACTION_ICON_KEYS,
  getTransactionIconComponent,
} from "@/lib/transaction-icons";
import { useI18n } from "@/lib/use-i18n";

type Props = {
  value: string;
  onChange: (key: string) => void;
  className?: string;
};

export function IconPickerGrid({ value, onChange, className = "" }: Props) {
  const { t } = useI18n();

  return (
    <div
      className={`grid grid-cols-6 gap-2 sm:grid-cols-7 ${className}`}
      role="listbox"
      aria-label={t.iconPicker.aria}
    >
      {TRANSACTION_ICON_KEYS.map((key) => {
        const selected = value === key;
        return (
          <motion.button
            key={key}
            type="button"
            role="option"
            aria-selected={selected}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(key)}
            className={`flex h-10 w-full items-center justify-center rounded-xl border-2 transition-colors ${
              selected
                ? "border-violet-500 bg-violet-500/15 text-violet-700 shadow-sm dark:border-violet-400 dark:bg-violet-500/20 dark:text-violet-200"
                : "border-zinc-200/80 bg-white/50 text-zinc-600 hover:border-zinc-300 hover:bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300 dark:hover:border-zinc-600"
            }`}
          >
            {createElement(getTransactionIconComponent(key), {
              className: "h-5 w-5",
              strokeWidth: 1.75,
            })}
          </motion.button>
        );
      })}
    </div>
  );
}
