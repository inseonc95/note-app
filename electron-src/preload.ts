/* eslint-disable @typescript-eslint/no-namespace */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { contextBridge, ipcRenderer } from "electron";
import { ChatMessage, Note } from "./lib/types";

// We are using the context bridge to securely expose NodeAPIs.
// Please note that many Node APIs grant access to local system resources.
// Be very cautious about which globals and APIs you expose to untrusted remote content.

const chat = {
  sendMessage: (messages: ChatMessage[], noteContent?: string) => ipcRenderer.invoke("request-chat", messages, noteContent),
  checkApiKey: () => ipcRenderer.invoke("check-api-key"),
  saveApiKey: (apiKey: string) => ipcRenderer.invoke("save-api-key", apiKey),
}

const note = {
  loadNotes: () => ipcRenderer.invoke("load-notes"),
  saveNote: (note: Note) => ipcRenderer.invoke("save-note", note),
  deleteNote: (id: string) => ipcRenderer.invoke("delete-note", id),
}

contextBridge.exposeInMainWorld("chat", chat);
contextBridge.exposeInMainWorld("note", note);