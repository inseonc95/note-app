// electron-src/handlers/chat.ts
import { ipcMain } from "electron";
import { OpenAIService } from "../service/chat";

export const setupChatHandlers = () => {
  ipcMain.handle("request-chat", async (_event, message: any, noteContent?: any) => {
    try {
      const openaiService = OpenAIService.getInstance();
      const response = await openaiService.generateChatResponse(message, noteContent ?? null);
      return response;
    } catch (error) {
      console.error("Error generating chat response:", error);
      throw error;
    }
  });
};