import { useChat } from "@/contexts/ChatContext"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Send, Trash2, Copy, Check, CheckCircle, X, Key } from "lucide-react"
import { useChatUI } from "@/contexts/ChatUIContext"
import { useState, useEffect } from "react"

export const AIChatInput = ({ isLoading, setIsLoading }: { isLoading: boolean, setIsLoading: (loading: boolean) => void }) => {
  const { selectedTexts, clearSelectedTexts, removeSelectedText, clearMessages, sendMessage, chatInputRef } = useChat()
  const { hasApiKey } = useChatUI()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!chatInputRef.current?.value.trim() || isLoading) return

    const userMessage = chatInputRef.current.value.trim()
    chatInputRef.current.value = ""
    setIsLoading(true)
    try {
      await sendMessage(userMessage)
    } finally {
      setIsLoading(false)
    }
  }
  return (

    <div className="px-2 py-2">
    <div className="flex flex-wrap gap-1 mb-2">
      {selectedTexts.map((text) => (
        <TooltipProvider key={text.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 bg-background text-secondary-foreground px-2 py-1 rounded-md text-xs">
                <span className="truncate max-w-[100px]">
                  {text.content}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => removeSelectedText(text.id)}
                >
                  <X className="size-3" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs whitespace-pre-wrap">{text.content}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {selectedTexts.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs"
          onClick={clearSelectedTexts}
        >
          Clear all
        </Button>
      )}
    </div>
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        ref={chatInputRef}
        className="flex-1 resize-none rounded-md border p-2 text-sm bg-background h-10"
        placeholder={hasApiKey ? "메시지를 입력하세요..." : "API 키를 등록해주세요"}
        rows={1}
        disabled={isLoading || !hasApiKey}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e as React.FormEvent)
          }
        }}
        autoFocus={true}
      />
      {hasApiKey && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit" size="icon" disabled={isLoading}>
                  <Send className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>메시지 보내기</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearMessages}
                  disabled={isLoading}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>모든 대화내용 삭제</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </form>
  </div>
  )
}