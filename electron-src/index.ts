// Native
import { join } from "path";
import { format } from "url";


// Packages
import { BrowserWindow, app, ipcMain, dialog } from "electron";
import isDev from "electron-is-dev";
import prepareNext from "electron-next";
import { setupHandlers } from "./handler";

// Prepare the renderer once the app is ready
let mainWindow: BrowserWindow | null = null;
let hasUnsavedChanges = false;

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

  mainWindow.on('close', async (event) => {
    event.preventDefault();


    mainWindow?.webContents.send('check-unsaved-changes');

    if (hasUnsavedChanges) {
      const { response } = await dialog.showMessageBox(mainWindow!, {
        type: 'warning',
        title: '저장되지 않은 변경사항',
      message: '저장되지 않은 변경사항이 있습니다. 정말 종료하시겠습니까?',
      buttons: ['취소', '종료'],
      defaultId: 0,
    })
    if (response === 1) {
        mainWindow?.destroy()
      }
    } else {
      mainWindow?.destroy()
    }
  })
});



// Quit the app once all windows are closed
app.on("window-all-closed", app.quit);

  // hasChanges 상태 변경을 감지하는 IPC 핸들러
ipcMain.on('update-has-changes', (_, hasChanges: boolean) => {
  // macOS에서만 title bar 버튼 스타일 변경
  if (process.platform === 'darwin' && mainWindow) {
    console.log('hasChanges', hasChanges)
    hasUnsavedChanges = hasChanges;
  }
})
