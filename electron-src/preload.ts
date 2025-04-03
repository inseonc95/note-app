/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { contextBridge, ipcRenderer } from "electron";
import { ChatMessage } from "./utils/types";
// We are using the context bridge to securely expose NodeAPIs.
// Please note that many Node APIs grant access to local system resources.
// Be very cautious about which globals and APIs you expose to untrusted remote content.


const api = {
  sendMessage: (messages: ChatMessage[], noteContent?: string) => ipcRenderer.invoke("request-chat", messages, noteContent),
  checkApiKey: () => ipcRenderer.invoke("check-api-key"),
  saveApiKey: (apiKey: string) => ipcRenderer.invoke("save-api-key", apiKey),
}

contextBridge.exposeInMainWorld("chat", api);