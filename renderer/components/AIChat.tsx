import { EditApiKeyButton } from "./AIChat/EditApiKeyButton"
import { AIChatInput } from "./AIChat/AIChatInput"
import { AIChatMessages } from "./AIChat/AIChatMessages"
import { AIChatApikey } from "./AIChat/AIChatApikey"
import { useChatUI } from "@/contexts/ChatUIContext"
export const AIChat = () => {  
  const { hasApiKey } = useChatUI()

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
              <AIChatMessages />
            ) : (
              <AIChatApikey />
            )}
          </div>
          <div>
            <AIChatInput />
          </div>
        </div>
      </div>
    </>
    )
}