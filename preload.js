const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  closeWindow: () => ipcRenderer.send("window-close"),
  minimizeWindow: () => ipcRenderer.send("window-minimize"),
  toggleMaximize: () => ipcRenderer.send("window-toggle-maximize"),
  getOpenAtLogin: () => ipcRenderer.invoke("get-open-at-login"),
  setOpenAtLogin: (open) => ipcRenderer.invoke("set-open-at-login", open),
  readAppData: () => ipcRenderer.invoke("read-app-data"),
  writeAppData: (partial) => ipcRenderer.invoke("write-app-data", partial),
});
