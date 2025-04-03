import { setupApiKeyHandlers } from "./apiKey";
import { setupChatHandlers } from "./chat";
// import { setupNotesHandlers } from "./notes";

export const setupHandlers = () => {
  setupApiKeyHandlers();
  setupChatHandlers();
  // setupNotesHandlers();
};