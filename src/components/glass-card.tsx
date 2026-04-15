"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

type Props = HTMLMotionProps<"div">;

export function GlassCard({ className = "", children, ...rest }: Props) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl border border-zinc-200/90 bg-white/75 shadow-sm shadow-zinc-900/4 backdrop-blur-xl dark:border-zinc-700/80 dark:bg-zinc-900/55 dark:shadow-black/25 ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
