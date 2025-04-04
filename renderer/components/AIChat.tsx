import { useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { useChat } from "@/contexts/ChatContext"
import { useNotes } from "@/contexts/NoteContext"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Trash2, Copy, Check, CheckCircle, X, Key } from "lucide-react"
import { useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ApiKeyButton } from "./ApiKeyButton"

export interface AIChatRef {
  focus: () => void
  setInputValue: (value: string) => void
}

export const AIChat = forwardRef<AIChatRef>((props, ref) => {
  const { 
    messages, 
    addMessage, 
    clearMessages, 
    isLoading, 
    setIsLoading,
    selectedTexts,
    removeSelectedText,
    clearSelectedTexts
  } = useChat()
  const { selectedNote, updateNote } = useNotes()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [appliedId, setAppliedId] = useState<string | null>(null)
  const [hasApiKey, setHasApiKey] = useState(false)

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus()
    },
    setInputValue: (value: string) => {
      if (inputRef.current) {
        inputRef.current.value = value
      }
    }
  }))

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])


  useEffect(() => {
    const checkApiKey = async () => {
      const hasKey = await window.chat.checkApiKey()
      setHasApiKey(hasKey)
    }
    checkApiKey()
  }, [])

  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(messageId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  const handleSave = async (apiKey: string) => {
    try {
      const response = await window.chat.saveApiKey(apiKey);
      if (response) {
        alert("API 키 등록에 성공했습니다.");
        setHasApiKey(true);
      }
    } catch (error) {
      alert("API 키 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleApply = async (messageId: string, content: string) => {
    if (!selectedNote) return
    
    try {
      // 기존 내용과 AI 응답을 구분하여 추가
      const newContent = selectedNote.content
        ? `${selectedNote.content}\n\n---\n\n${content}`
        : content

      await updateNote(selectedNote.id, {
        ...selectedNote,
        content: newContent
      })
      setAppliedId(messageId)
      setTimeout(() => setAppliedId(null), 2000)
    } catch (err) {
      console.error("Failed to apply text:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputRef.current?.value.trim() || isLoading) return

    const userMessage = inputRef.current.value.trim()
    inputRef.current.value = ""
    addMessage("user", userMessage)
    setIsLoading(true)
    try {
      const updatedMessages = [
        ...messages,
        { role: "user" as const, content: userMessage }
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
    } catch (error) {
      addMessage(
        "assistant",
        "죄송합니다. AI 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex h-8 items-center border-b px-4 mt-2">
        <h2 className="text-sm font-semibold cursor-help">AI Assistant</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ApiKeyButton handleSave={handleSave} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>API 키를 설정하여 AI Assistant를 사용할 수 있습니다.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-hidden">
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
                      className={`max-w-[80%] rounded-lg p-3 ${
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
          </div>
          <div>
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
                  ref={inputRef}
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
          </div>
        </div>
        </div>
        </>
    )
}) 