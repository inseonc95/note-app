export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}


export interface Note {
  id: string
  title: string
  filename: string
  content: string
  createdAt: string
  updatedAt: string
}