import { createContext, useContext, useState, useRef, ReactNode, useCallback, useEffect } from "react"

interface ChatUIContextType {

  // AI Chat 패널 상태 관리
  isShowAIChat: boolean
  toggleAIChat: () => void

  // API 키 상태 관리
  hasApiKey: boolean

  // API 키 저장
  saveApiKey: (apiKey: string) => Promise<boolean>
}


const ChatUIContext = createContext<ChatUIContextType | undefined>(undefined)

export function ChatUIProvider({ children }: { children: ReactNode }) {
  const [isShowAIChat, setIsShowAIChat] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)

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

  const saveApiKey = async (apiKey: string) => {
    try {
      const hasKey = await window.chat.saveApiKey(apiKey)
      if (hasKey) {
        setHasApiKey(true)
      }
      return hasKey
    } catch (error) {
      throw error
    }
  }

  return (
    <ChatUIContext.Provider value={{ isShowAIChat, toggleAIChat, hasApiKey, saveApiKey }}>
      {children}
    </ChatUIContext.Provider>
  )
}


export function useChatUI() {
  const context = useContext(ChatUIContext)
  if (context === undefined) {
    throw new Error("useChatUI must be used within a ChatUIProvider")
  }
  return context
}