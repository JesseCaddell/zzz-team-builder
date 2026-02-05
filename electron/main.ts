import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { loadDataFromDb } from "./db";

process.on("uncaughtException", (err) => {
  console.error("UncaughtException:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("UnhandledRejection:", reason);
});

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const preloadPath = path.join(app.getAppPath(), "dist-electron", "preload.mjs");
  console.log("Preload path:", preloadPath);

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    backgroundColor: "#0b0b0b",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl =
      process.env.VITE_DEV_SERVER_URL ||
      process.env.ELECTRON_RENDERER_URL ||
      "http://localhost:5173/";

  if (!app.isPackaged) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "dist", "index.html"));
  }
}

ipcMain.handle("zzz:loadData", async () => {
  try {
    return loadDataFromDb();
  } catch (err) {
    console.error("zzz:loadData failed:", err);
    throw err;
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

