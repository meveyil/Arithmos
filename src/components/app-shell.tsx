"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { DashboardView } from "@/components/dashboard-view";
import { OnboardingModal } from "@/components/onboarding-modal";
import { SettingsView } from "@/components/settings-view";
import { useSettings } from "@/components/settings-provider";
import { Sidebar, type AppSection } from "@/components/sidebar";
import { TemplatesView } from "@/components/templates-view";
import { TitleBar } from "@/components/title-bar";
import { TransactionsView } from "@/components/transactions-view";

const panelTransition = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function AppShell() {
  const [section, setSection] = useState<AppSection>("dashboard");
  const { onboardingCompleted, settingsHydrated } = useSettings();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar active={section} onSelect={setSection} />
        <main className="relative min-h-0 min-w-0 flex-1 bg-linear-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
          <AnimatePresence mode="wait">
            {section === "dashboard" && (
              <motion.div
                key="dashboard"
                className="absolute inset-0 flex flex-col"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={panelTransition}
              >
                <DashboardView />
              </motion.div>
            )}
            {section === "transactions" && (
              <motion.div
                key="transactions"
                className="absolute inset-0 flex flex-col"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={panelTransition}
              >
                <TransactionsView />
              </motion.div>
            )}
            {section === "templates" && (
              <motion.div
                key="templates"
                className="absolute inset-0 flex flex-col"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={panelTransition}
              >
                <TemplatesView />
              </motion.div>
            )}
            {section === "settings" && (
              <motion.div
                key="settings"
                className="absolute inset-0 flex flex-col"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={panelTransition}
              >
                <SettingsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      {settingsHydrated && !onboardingCompleted && <OnboardingModal />}
    </div>
  );
}
