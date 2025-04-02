/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { contextBridge, ipcRenderer } from "electron";
import { ChatMessage } from "./chat";
// We are using the context bridge to securely expose NodeAPIs.
// Please note that many Node APIs grant access to local system resources.
// Be very cautious about which globals and APIs you expose to untrusted remote content.
contextBridge.exposeInMainWorld("electron", {
  sayHello: (messages: ChatMessage[], noteContent?: string) => ipcRenderer.invoke("message", messages, noteContent),
  checkApiKey: () => ipcRenderer.invoke("check-api-key"),
  saveApiKey: (apiKey: string) => ipcRenderer.invoke("save-api-key", apiKey),
});
