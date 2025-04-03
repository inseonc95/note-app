// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import User from 'path/to/interfaces';
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  interface Window {
    chat: {
      sendMessage: (  messages: ChatMessage[],
        noteContent?: string) => Promise<string>;
      checkApiKey: () => Promise<boolean>;
      saveApiKey: (apiKey: string) => Promise<boolean>;
    };
    note: {
      loadNotes: () => Promise<Note[]>;
      saveNote: (note: Note) => Promise<void>;
      deleteNote: (id: string) => Promise<void>;
    };
  }
}

export type User = {
  id: number;
  name: string;
};
