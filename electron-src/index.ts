// Native
import { join } from "path";
import { format } from "url";
import { dialog } from "electron";
import fs from "fs";

// Packages
import { BrowserWindow, app, ipcMain, IpcMainEvent } from "electron";
import isDev from "electron-is-dev";
import prepareNext from "electron-next";

import { generateChatResponse } from "./chat";

// Prepare the renderer once the app is ready
app.on("ready", async () => {
  await prepareNext("./renderer");

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "preload.js"),
    },
  });

  const url = isDev
    ? "http://localhost:8000/"
    : format({
        pathname: join(__dirname, "../renderer/out/index.html"),
        protocol: "file:",
        slashes: true,
      });

  mainWindow.loadURL(url);
});

// Quit the app once all windows are closed
app.on("window-all-closed", app.quit);

const API_KEY_PATH = join(__dirname, "api_key.json");

// IPC handlers
ipcMain.handle("check-api-key", () => {
  return fs.existsSync(API_KEY_PATH);
});

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on("message", async (event: IpcMainEvent, message: any, noteContent?: any) => {
  const response = await generateChatResponse(message, noteContent? noteContent : null);
  if (!response) {
    dialog.showMessageBox({
      title: 'Error',
      message: 'Invalid API key. Please check your API key and try again.',
    });
    return;
  }
  setTimeout(() => event.sender.send("message", response), 500);
});

ipcMain.on("save-api-key", async (event: IpcMainEvent, apiKey: string) => {
  fs.writeFileSync(API_KEY_PATH, JSON.stringify({ apiKey }));
  console.log("API Key saved:", apiKey);

  setTimeout(() => {
    event.sender.send("api-key-saved");
  }, 1000);
});
