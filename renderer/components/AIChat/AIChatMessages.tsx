import { useChat } from "@/contexts/ChatContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Check, CheckCircle, Copy } from "lucide-react"
import { useRef, useEffect, useState } from "react"
import { useNotes } from "@/contexts/NoteContext"
import { useChatUI } from "@/contexts/ChatUIContext"


export const AIChatMessages = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [appliedId, setAppliedId] = useState<string | null>(null)

  
  const { messages, applyToEditor } = useChat()
  const { isLoading } = useChatUI()
  const { selectedNote } = useNotes()
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(messageId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }
  

  const handleApply = async (messageId: string, content: string) => {
    if (!selectedNote) return
    
    try {
      applyToEditor(content)
      setAppliedId(messageId)
      setTimeout(() => setAppliedId(null), 2000)
    } catch (err) {
      console.error("Failed to apply text:", err)
    }
  }

  return (
    <ScrollArea className="h-full">
            
    <div className="p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[100%] w-full rounded-lg p-3 ${
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-background"
            }`}
          >
            <div className="text-sm whitespace-pre-wrap">
              {message.content}
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-xs opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </div>
              {message.role === "assistant" && (
                <div className="flex gap-1 ml-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(message.id, message.content)}
                        >
                          {copiedId === message.id ? (
                            <Check className="size-3" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>복사하기</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleApply(message.id, message.content)}
                        >
                          {appliedId === message.id ? (
                            <CheckCircle className="size-3 text-green-500" />
                          ) : (
                            <CheckCircle className="size-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {selectedNote ? (
                          <p>"{selectedNote?.title}"에 적용됩니다</p>
                        ) : (
                          <p>적용할 메모를 선택해주세요</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-muted rounded-lg p-3">
            <div className="text-sm">AI가 응답을 생성하는 중...</div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  </ScrollArea>
  )
}