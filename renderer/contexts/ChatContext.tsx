import { createContext, useContext, useState, ReactNode } from "react"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface SelectedText {
  id: string
  content: string
}

interface ChatContextType {
  messages: Message[]
  selectedTexts: SelectedText[]
  isLoading: boolean
  addMessage: (role: "user" | "assistant", content: string) => void
  clearMessages: () => void
  setIsLoading: (loading: boolean) => void
  addSelectedText: (content: string) => void
  removeSelectedText: (id: string) => void
  clearSelectedTexts: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedTexts, setSelectedTexts] = useState<SelectedText[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const clearMessages = () => {
    setMessages([])
  }

  const addSelectedText = (content: string) => {
    const newText: SelectedText = {
      id: Date.now().toString(),
      content,
    }
    setSelectedTexts((prev) => [...prev, newText])
  }

  const removeSelectedText = (id: string) => {
    setSelectedTexts((prev) => prev.filter((text) => text.id !== id))
  }

  const clearSelectedTexts = () => {
    setSelectedTexts([])
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        selectedTexts,
        isLoading,
        addMessage,
        clearMessages,
        setIsLoading,
        addSelectedText,
        removeSelectedText,
        clearSelectedTexts,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
} 