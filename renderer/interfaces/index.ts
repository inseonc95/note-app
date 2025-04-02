// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ChatMessage } from "@/utils/chat";
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  interface Window {
    electron: {
      sayHello: (  messages: ChatMessage[],
        noteContent?: string) => Promise<string>;
      checkApiKey: () => Promise<boolean>;
      saveApiKey: (apiKey: string) => Promise<boolean>;
    };
  }
}

export type User = {
  id: number;
  name: string;
};
