"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { CircleAlert } from "lucide-react";
import { GlassCard } from "@/components/glass-card";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  icon?: LucideIcon;
};

export function ConfirmationDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  closeLabel,
  onConfirm,
  onClose,
  icon: Icon = CircleAlert,
}: ConfirmationDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.button
            type="button"
            aria-label={closeLabel}
            className="absolute inset-0 bg-zinc-950/28 backdrop-blur-md dark:bg-black/44"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative w-full max-w-md"
          >
            <GlassCard className="border-zinc-200/90 bg-white/84 p-7 shadow-xl dark:border-zinc-700/90 dark:bg-zinc-900/84">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-5 text-center text-base font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                {title}
              </h3>
              <p className="mt-2 text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {body}
              </p>
              <div className="mt-7 flex gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-zinc-200/90 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                >
                  {cancelLabel}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex-1 rounded-2xl border border-zinc-300/90 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white dark:border-zinc-600 dark:bg-white dark:text-zinc-900"
                >
                  {confirmLabel}
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
