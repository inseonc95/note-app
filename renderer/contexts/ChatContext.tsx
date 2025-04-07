import { createContext, useContext, useState, useRef, ReactNode, useCallback, useEffect } from "react"

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
  isShowAIChat: boolean
  toggleAIChat: () => void
  addMessage: (role: "user" | "assistant", content: string) => void
  clearMessages: () => void
  setIsLoading: (loading: boolean) => void
  addSelectedText: (content: string) => void
  removeSelectedText: (id: string) => void
  clearSelectedTexts: () => void
  focusChatInput: () => void
  chatInputRef: React.RefObject<HTMLTextAreaElement>
  setEditorRef: (ref: { handleApply: (content: string) => void } | null) => void
  applyToEditor: (content: string) => void
  hasApiKey: boolean
  setHasApiKey: (hasApiKey: boolean) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTexts, setSelectedTexts] = useState<SelectedText[]>([])
  const [isShowAIChat, setIsShowAIChat] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<{ handleApply: (content: string) => void } | null>(null)

  const checkApiKey = useCallback(async () => {
    const hasKey = await window.chat.checkApiKey()
    setHasApiKey(hasKey)
  }, [])

  useEffect(() => {
    checkApiKey()
  }, [checkApiKey])

  const toggleAIChat = () => {
    setIsShowAIChat(prev => !prev);
  }

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
    chatInputRef.current?.focus()
  }

  const setEditorRef = (ref: { handleApply: (content: string) => void } | null) => {
    editorRef.current = ref
  }

  const applyToEditor = (content: string) => {
    editorRef.current?.handleApply(content)
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        clearMessages,
        isLoading,
        setIsLoading,
        selectedTexts,
        addSelectedText,
        removeSelectedText,
        clearSelectedTexts,
        chatInputRef,
        focusChatInput,
        setEditorRef,
        applyToEditor,
        isShowAIChat,
        toggleAIChat,
        hasApiKey,
        setHasApiKey,
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