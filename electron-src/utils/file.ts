import fs from "fs"
import { join } from "path"

const API_KEY_PATH = join(__dirname, "../api_key.json");

export const loadApiKey = () => {
  try {
    if (fs.existsSync(API_KEY_PATH)) {
      const data = fs.readFileSync(API_KEY_PATH, "utf-8");
      return JSON.parse(data).apiKey;
    }
    return null;
  } catch (error) {
    console.error("Error loading API key:", error);
    return null;
  }
};

export const saveApiKey = (apiKey: string) => {
  try {
    fs.writeFileSync(API_KEY_PATH, JSON.stringify({ apiKey }));
    return true;
  } catch (error) {
    console.error("Error saving API key:", error);
    return false;
  }
};

export const checkApiKey = () => {
  return fs.existsSync(API_KEY_PATH);
};