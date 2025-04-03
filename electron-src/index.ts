// Native
import { join } from "path";
import { format } from "url";


// Packages
import { BrowserWindow, app, ipcMain } from "electron";
import isDev from "electron-is-dev";
import prepareNext from "electron-next";
import { setupHandlers } from "./handler";
import { NoteService } from './service/note'

// Prepare the renderer once the app is ready
app.on("ready", async () => {
  await prepareNext("./renderer");
  setupHandlers();
  
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

  // setupHandlers();

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

const noteService = new NoteService()

// Note 관련 IPC 핸들러 설정
ipcMain.handle('load-notes', async () => {
  return await noteService.loadNotes()
})

ipcMain.handle('save-note', async (_, note) => {
  await noteService.saveNote(note)
})

ipcMain.handle('delete-note', async (_, id) => {
  await noteService.deleteNote(id)
})

