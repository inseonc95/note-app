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
  // 메시지 관리
  messages: Message[] 
  clearMessages: () => void // AIChatInput에서 호출
  sendMessage: (content: string) => Promise<void> // AIChatInput에서 호출, message와 selectedTexts를 포함하여 메시지 전송
  
  // 선택된 텍스트 관리
  selectedTexts: SelectedText[] 
  addSelectedText: (content: string) => void // Editor에서 호출
  removeSelectedText: (id: string) => void // AIChatInput에서 호출
  clearSelectedTexts: () => void // AIChatInput에서 호출

  // 에디터 참조 관리
  setEditorRef: (ref: { handleApply: (content: string) => void } | null) => void // Editor에서 호출
  applyToEditor: (content: string) => void // AIChatMessages에서 호출

  // AIChatInput 참조 관리
  chatInputRef: React.RefObject<HTMLTextAreaElement>
  focusChatInput: () => void // AIChatInput에서 호출

  // InlineChat 메시지 전송
  sendMessageToInlineChat: (content: string, context: string) => Promise<string>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedTexts, setSelectedTexts] = useState<SelectedText[]>([])
  const editorRef = useRef<{ handleApply: (content: string) => void } | null>(null)

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

    setSelectedTexts(prev => {
      const isDuplicate = prev.some(text => text.content === content.trim())
      if (!isDuplicate) {
        return [...prev, {
          id: Date.now().toString(),
          content: content.trim()
        }]
      }
      return prev
    })

    focusChatInput() // AiChat패널이 열려있으면 포커스를 에디터에서 이동시키기 위해 호출
  }

  const focusChatInput = () => {
    chatInputRef.current?.focus()
  }

  const removeSelectedText = (id: string) => {
    setSelectedTexts((prev) => prev.filter((text) => text.id !== id))
  }

  const clearSelectedTexts = () => {
    setSelectedTexts([])
  }


  const setEditorRef = (ref: { handleApply: (content: string) => void } | null) => {
    editorRef.current = ref
  }

  const applyToEditor = (content: string) => {
    editorRef.current?.handleApply(content)
  }

  const sendMessage = async (content: string) => {
    addMessage("user", content)
    try {
      const updatedMessages = [
        ...messages,
        { role: "user" as const, content: content }
      ]
      const apiMessages = updatedMessages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      }))

      // 선택된 텍스트들을 컨텍스트로 포함
      const contextTexts = selectedTexts.map(text => text.content).join("\n\n")
      const response = await window.chat.sendMessage(
        apiMessages,
        contextTexts || null
      )
      addMessage("assistant", response)
      clearSelectedTexts()
    } catch (error) {
      addMessage(
        "assistant",
        "죄송합니다. AI 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요."
      )
    }
  }

  const sendMessageToInlineChat = async (content: string, context: string) => {
    const response = await window.chat.sendMessage(
      [{ role: "user" as const, content: content }],
      context
    )
    return response
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        clearMessages,
        selectedTexts,
        addSelectedText,
        removeSelectedText,
        clearSelectedTexts,
        setEditorRef,
        applyToEditor,
        sendMessage,
        chatInputRef,
        focusChatInput,
        sendMessageToInlineChat,
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