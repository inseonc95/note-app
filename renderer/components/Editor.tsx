import { useNotes } from "@/contexts/NoteContext"
import { useRef, useEffect, useState } from "react"
import { AIChatRef } from "./AIChat"
import { Button } from "@/components/ui/button"
import { Command, Send, X, Plus } from "lucide-react"
import { useChat } from "@/contexts/ChatContext"


export const Editor = () => {
  const { selectedNote, updateNote } = useNotes()
  const { addSelectedText } = useChat()
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [showButton, setShowButton] = useState(false)
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 })
  const [content, setContent] = useState(selectedNote?.content || "")
  const [title, setTitle] = useState(selectedNote?.title || "")

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    if (selectedNote) {
      updateNote(selectedNote.id, {
        ...selectedNote,
        title: newTitle,
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    if (selectedNote) {
      updateNote(selectedNote.id, {
        ...selectedNote,
        content: newContent,
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      const editor = editorRef.current
      if (!editor) return

      const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd)
      if (selectedText.trim()) {
        addSelectedText(selectedText)
        setShowButton(false)
      }
    }
  }

  const handleSelection = () => {
    const editor = editorRef.current
    if (!editor) return

    const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd)
    if (selectedText.trim()) {
      const rect = editor.getBoundingClientRect()
      const lineHeight = parseInt(window.getComputedStyle(editor).lineHeight)
      const lines = selectedText.split("\n").length
      const top = rect.top + (lineHeight * lines) + 5
      const left = rect.left + 5

      setButtonPosition({ top, left })
      setShowButton(true)
    } else {
      setShowButton(false)
    }
  }

  const handleAddToChat = () => {
    const editor = editorRef.current
    if (!editor) return

    const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd)
    if (selectedText.trim()) {
      addSelectedText(selectedText)
      setShowButton(false)
    }
  }

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const handleMouseUp = () => {
      handleSelection()
    }

    const handleKeyUp = () => {
      handleSelection()
    }

    editor.addEventListener("mouseup", handleMouseUp)
    editor.addEventListener("keyup", handleKeyUp)

    return () => {
      editor.removeEventListener("mouseup", handleMouseUp)
      editor.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  useEffect(() => {
    setContent(selectedNote?.content || "")
    setTitle(selectedNote?.title || "")
  }, [selectedNote])

  if (!selectedNote) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        노트를 선택하거나 새로 만들어주세요
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="p-4 space-y-4 relative">
          <textarea
            ref={titleRef}
            className="w-full resize-none border-none bg-transparent text-2xl font-bold focus:outline-none"
            placeholder="제목을 입력하세요..."
            value={title}
            onChange={handleTitleChange}
          />
          <textarea
            ref={editorRef}
            className="w-full h-[calc(100vh-12rem)] resize-none border-none bg-transparent focus:outline-none"
            placeholder="내용을 입력하세요..."
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSelect={handleSelection}
          />
          {showButton && (
            <div
              className="fixed z-50 bg-primary text-primary-foreground px-2 py-1 rounded-md shadow-lg"
              style={{
                top: `${buttonPosition.top}px`,
                left: `${buttonPosition.left}px`,
              }}
            >
              <Button
                size="sm"
                className="h-6 text-xs"
                onClick={handleAddToChat}
              >
                <span
                >Add to chat</span>
                <div className="flex items-center text-gray-400">
                  <Command className="size-3 ml-2" />
                  <span className="font-mono">K</span>
                  
                </div>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 