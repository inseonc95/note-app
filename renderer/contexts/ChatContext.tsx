import { createContext, useContext, useState, useRef, ReactNode } from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface SelectedText {
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
  focusChatInput: () => void
  chatInputRef: React.RefObject<HTMLTextAreaElement>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedTexts, setSelectedTexts] = useState<SelectedText[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)

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
    if (!content.trim()) return

    const isDuplicate = selectedTexts.some(text => text.content === content)
    if (!isDuplicate) {
      const newText: SelectedText = {
        id: Date.now().toString(),
        content: content.trim(),
      }
      setSelectedTexts((prev) => [...prev, newText])
      focusChatInput()
    }
  }

  const removeSelectedText = (id: string) => {
    setSelectedTexts((prev) => prev.filter((text) => text.id !== id))
  }

  const clearSelectedTexts = () => {
    setSelectedTexts([])
  }

  const focusChatInput = () => {
    if (chatInputRef.current) {
      chatInputRef.current.focus()
    }
  }

  // 초기 상태에서도 selectedTexts가 항상 존재하도록 보장
  const contextValue = {
    messages,
    selectedTexts: selectedTexts || [],
    isLoading,
    addMessage,
    clearMessages,
    setIsLoading,
    addSelectedText,
    removeSelectedText,
    clearSelectedTexts,
    focusChatInput,
    chatInputRef,
  }

  return (
    <ChatContext.Provider value={contextValue}>
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