import { ipcMain } from "electron";
import { checkApiKey, saveApiKey, loadApiKey } from "../utils/file";
import { OpenAIService } from "../service/chat";

export const setupApiKeyHandlers = () => {
  ipcMain.handle("check-api-key", () => {
    const hasKey = checkApiKey();
    if (hasKey) {
      const openaiService = OpenAIService.getInstance();
      openaiService.setApiKey(loadApiKey());
    }
    return hasKey;
  });

  ipcMain.handle("save-api-key", async (_event, apiKey: string) => {
    try {
      const openaiService = OpenAIService.getInstance();
      await openaiService.validateApiKey(apiKey);
      saveApiKey(apiKey);
      openaiService.setApiKey(apiKey);
      return true;
    } catch (error) {
      console.error("Error saving API key:", error);
      throw error;
    }
  });
};