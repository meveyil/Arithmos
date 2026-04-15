export const LS_TRANSACTION_KEYS = [
  "arithmos-transactions",
  "diafaneia-transactions",
] as const;

export const LS_SETTINGS_KEYS = [
  "arithmos-settings",
  "diafaneia-settings",
] as const;

export type AppDataSnapshot = {
  fileExists: boolean;
  data: {
    transactions?: unknown;
    settings?: unknown;
  };
};

let snapshotPromise: Promise<AppDataSnapshot> | null = null;

export function resetAppDataSnapshotCache() {
  snapshotPromise = null;
}

export function loadAppDataSnapshot(): Promise<AppDataSnapshot> {
  if (typeof window === "undefined") {
    return Promise.resolve({ fileExists: false, data: {} });
  }
  const api = window.electronAPI;
  if (!api?.readAppData) {
    return Promise.resolve({ fileExists: false, data: {} });
  }
  if (!snapshotPromise) {
    snapshotPromise = api.readAppData();
  }
  return snapshotPromise;
}

function readFirstLocalStorageJson(keys: readonly string[]): unknown {
  if (typeof window === "undefined") return undefined;
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      continue;
    }
  }
  return undefined;
}

function clearLocalStorageKeys(keys: readonly string[]) {
  try {
    for (const key of keys) {
      localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}

export async function migrateLegacyLocalStorageToDiskIfNeeded(): Promise<void> {
  const api = window.electronAPI;
  if (!api?.readAppData || !api?.writeAppData) return;

  const snap = await api.readAppData();
  if (snap.fileExists) return;

  const transactionsRaw = readFirstLocalStorageJson(LS_TRANSACTION_KEYS);
  const settingsRaw = readFirstLocalStorageJson(LS_SETTINGS_KEYS);

  const partial: { transactions?: unknown; settings?: unknown } = {};
  if (transactionsRaw !== undefined) partial.transactions = transactionsRaw;
  if (
    settingsRaw !== undefined &&
    typeof settingsRaw === "object" &&
    settingsRaw !== null &&
    !Array.isArray(settingsRaw)
  ) {
    partial.settings = settingsRaw;
  }

  const wrote =
    partial.transactions !== undefined || partial.settings !== undefined;
  if (wrote) {
    await api.writeAppData(partial);
    resetAppDataSnapshotCache();
  }

  if (wrote) {
    clearLocalStorageKeys([
      ...LS_TRANSACTION_KEYS,
      ...LS_SETTINGS_KEYS,
    ]);
  }
}

export async function persistAppDataPartial(partial: {
  transactions?: unknown;
  settings?: unknown;
}) {
  const api = window.electronAPI;
  if (!api?.writeAppData) return;
  await api.writeAppData(partial);
}

export function isElectronFileStorage(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean(window.electronAPI?.readAppData && window.electronAPI?.writeAppData)
  );
}
