export {};

declare global {
  interface Window {
    electronAPI?: {
      closeWindow: () => void;
      minimizeWindow: () => void;
      toggleMaximize: () => void;
      getOpenAtLogin?: () => Promise<boolean>;
      setOpenAtLogin?: (open: boolean) => Promise<void>;
      readAppData?: () => Promise<{
        fileExists: boolean;
        data: {
          transactions?: unknown;
          settings?: unknown;
        };
      }>;
      writeAppData?: (partial: {
        transactions?: unknown;
        settings?: unknown;
      }) => Promise<void>;
    };
  }
}
