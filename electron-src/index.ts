// Native
import { join } from "path";
import { format } from "url";


// Packages
import { BrowserWindow, app, ipcMain } from "electron";
import isDev from "electron-is-dev";
import prepareNext from "electron-next";
import { setupHandlers } from "./handler";

// Prepare the renderer once the app is ready
let mainWindow: BrowserWindow | null = null;

app.on("ready", async () => {
  await prepareNext("./renderer");
  setupHandlers();
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "preload.js"),
    },
    icon: join(__dirname, "../assets/png/appicon.png"),
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

  // hasChanges 상태 변경을 감지하는 IPC 핸들러
ipcMain.on('update-has-changes', (_, hasChanges: boolean) => {
  // macOS에서만 title bar 버튼 스타일 변경
  if (process.platform === 'darwin' && mainWindow) {
    console.log('hasChanges', hasChanges)
  }
})
