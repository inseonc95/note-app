// Native
import { join } from "path";
import { format } from "url";
import fs from "fs";

// Packages
import { BrowserWindow, app, ipcMain, IpcMainInvokeEvent } from "electron";
import isDev from "electron-is-dev";
import prepareNext from "electron-next";

import { generateChatResponse } from "./chat";
import { OpenAI } from "openai";

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
ipcMain.handle("message", async (_event: IpcMainInvokeEvent, message: any, noteContent?: any) => {

  try {
    const response = await generateChatResponse(message, noteContent? noteContent : null);
    return response;
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw error;
  }
});

ipcMain.handle("save-api-key", async (_event: IpcMainInvokeEvent, apiKey: string) => {
  try {
    const openai = new OpenAI({ apiKey });
    await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "test" }],
      max_tokens: 1
    });
    fs.writeFileSync(API_KEY_PATH, JSON.stringify({ apiKey }));
    console.log("API Key saved:", apiKey);
    return true;
  } catch (error) {
    console.error("Error saving API key:", error);
    throw error;
  }
});
