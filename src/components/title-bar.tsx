"use client";

import type { CSSProperties } from "react";
import { APP_NAME } from "@/config/app";
import { useI18n } from "@/lib/use-i18n";

const dragStyle = { WebkitAppRegion: "drag" } as CSSProperties;
const noDragStyle = { WebkitAppRegion: "no-drag" } as CSSProperties;

function closeApp() {
  if (typeof window !== "undefined" && window.electronAPI?.closeWindow) {
    window.electronAPI.closeWindow();
    return;
  }
  window.close();
}

function minimize() {
  if (window.electronAPI?.minimizeWindow) {
    window.electronAPI.minimizeWindow();
    return;
  }
}

function toggleMaximize() {
  if (window.electronAPI?.toggleMaximize) {
    window.electronAPI.toggleMaximize();
    return;
  }
  if (typeof document === "undefined") return;
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  } else {
    void document.documentElement.requestFullscreen?.();
  }
}

export function TitleBar() {
  const { t } = useI18n();

  return (
    <header className="flex h-8 min-h-8 max-h-8 shrink-0 select-none items-stretch border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div
        className="flex shrink-0 items-center pl-3 [-webkit-app-region:drag]"
        style={dragStyle}
      >
        <span className="pointer-events-none text-xs font-medium tracking-tight text-zinc-500 dark:text-zinc-400">
          {APP_NAME}
        </span>
      </div>

      <div
        className="min-h-8 min-w-0 flex-1 [-webkit-app-region:drag]"
        style={dragStyle}
        aria-hidden
      />

      <div
        className="flex shrink-0 items-center gap-2 pr-4 [-webkit-app-region:no-drag]"
        style={noDragStyle}
      >
        <button
          type="button"
          aria-label={t.titleBar.minimize}
          onClick={minimize}
          className="h-3 w-3 cursor-pointer rounded-full bg-[#febc2e] shadow-sm ring-1 ring-black/10 transition hover:brightness-95 active:scale-90 active:brightness-90"
          style={noDragStyle}
        />
        <button
          type="button"
          aria-label={t.titleBar.maximize}
          onClick={toggleMaximize}
          className="h-3 w-3 cursor-pointer rounded-full bg-[#28c840] shadow-sm ring-1 ring-black/10 transition hover:brightness-95 active:scale-90 active:brightness-90"
          style={noDragStyle}
        />
        <button
          type="button"
          aria-label={t.titleBar.close}
          onClick={closeApp}
          className="h-3 w-3 cursor-pointer rounded-full bg-[#ff5f57] shadow-sm ring-1 ring-black/10 transition hover:brightness-95 active:scale-90 active:brightness-90"
          style={noDragStyle}
        />
      </div>
    </header>
  );
}
