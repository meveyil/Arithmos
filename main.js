const fs = require("fs");
const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");

const DATA_FILE = "arithmos_data.json";
const ALLOWED_IPC_CHANNELS = new Set([
  "window-close",
  "window-minimize",
  "window-toggle-maximize",
  "get-open-at-login",
  "set-open-at-login",
  "read-app-data",
  "write-app-data",
]);

function validateWritePartial(partial) {
  if (!partial || typeof partial !== "object" || Array.isArray(partial)) {
    return false;
  }
  const allowedKeys = new Set(["transactions", "settings"]);
  for (const key of Object.keys(partial)) {
    if (!allowedKeys.has(key)) return false;
  }
  if (partial.transactions !== undefined && !Array.isArray(partial.transactions)) {
    return false;
  }
  if (
    partial.settings !== undefined &&
    (typeof partial.settings !== "object" ||
      Array.isArray(partial.settings) ||
      partial.settings === null)
  ) {
    return false;
  }
  return true;
}


function getDataFilePath() {
  return path.join(app.getPath("userData"), DATA_FILE);
}

function readDataFromDisk() {
  const fp = getDataFilePath();
  if (!fs.existsSync(fp)) {
    return { fileExists: false, data: {} };
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(fp, "utf8"));
    const data =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    return { fileExists: true, data };
  } catch {
    return { fileExists: true, data: {} };
  }
}

function writeDataMerge(partial) {
  const fp = getDataFilePath();
  const dir = path.dirname(fp);
  fs.mkdirSync(dir, { recursive: true });

  let prev = {};
  if (fs.existsSync(fp)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(fp, "utf8"));
      prev =
        parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed
          : {};
    } catch {
      prev = {};
    }
  }

  const next = { ...prev };
  if (partial && typeof partial === "object") {
    if (partial.transactions !== undefined) {
      next.transactions = partial.transactions;
    }
    if (partial.settings !== undefined) {
      next.settings = partial.settings;
    }
  }

  const payload = JSON.stringify(next, null, 2);
  const tmp = path.join(dir, `.${DATA_FILE}.${process.pid}.tmp`);
  fs.writeFileSync(tmp, payload, "utf8");
  try {
    if (fs.existsSync(fp)) {
      fs.unlinkSync(fp);
    }
  } catch {
  }
  fs.renameSync(tmp, fp);
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 845,
    minWidth: 1200,
    minHeight: 845,
    frame: false,
    show: false,
    icon: path.join(__dirname, "build", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      sandbox: false,
    },
  });

  mainWindow.setIcon(path.join(__dirname, 'build', 'icon.ico'));

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (!app.isPackaged) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    mainWindow.loadFile(path.join(__dirname, "out", "index.html"));
  }
}

ipcMain.on("window-close", (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close();
});

ipcMain.on("window-minimize", (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize();
});

ipcMain.on("window-toggle-maximize", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  if (win.isMaximized()) win.unmaximize();
  else win.maximize();
});

ipcMain.handle("get-open-at-login", () => {
  try {
    return app.getLoginItemSettings().openAtLogin;
  } catch {
    return false;
  }
});

ipcMain.handle("set-open-at-login", (_event, open) => {
  if (typeof open !== "boolean" && open !== 0 && open !== 1) return;
  app.setLoginItemSettings({ openAtLogin: Boolean(open) });
});

ipcMain.handle("read-app-data", () => readDataFromDisk());

ipcMain.handle("write-app-data", (_event, partial) => {
  if (!validateWritePartial(partial)) {
    console.warn("[IPC] write-app-data: invalid payload rejected");
    return;
  }
  writeDataMerge(partial);
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
