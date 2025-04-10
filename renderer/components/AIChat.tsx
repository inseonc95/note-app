import { EditApiKeyButton } from "./AIChat/EditApiKeyButton"
import { AIChatInput } from "./AIChat/AIChatInput"
import { AIChatMessages } from "./AIChat/AIChatMessages"
import { AIChatApikey } from "./AIChat/AIChatApikey"
import { useChatUI } from "@/contexts/ChatUIContext"
import { useState } from "react"

export const AIChat = () => {  
  const { hasApiKey } = useChatUI()

  const [isLoading, setIsLoading] = useState(false)

  return (
    <>
      <div className="flex h-8 items-center border-b px-4 mt-2">
        <h2 className="text-sm font-semibold cursor-help">AI Assistant</h2>
        {hasApiKey && (
          <EditApiKeyButton />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-hidden">
            {hasApiKey ? (
              <AIChatMessages isLoading={isLoading} />
            ) : (
              <AIChatApikey />
            )}
          </div>
          <div>
            <AIChatInput isLoading={isLoading} setIsLoading={setIsLoading} />
          </div>
        </div>
      </div>
    </>
    )
}