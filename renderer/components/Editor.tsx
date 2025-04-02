import { useNotes } from "@/contexts/NoteContext"
import { useRef, useEffect, useState } from "react"
import { AIChatRef } from "./AIChat"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useChat } from "@/contexts/ChatContext"

interface EditorProps {
  aiChatRef: React.RefObject<AIChatRef>
}

export const Editor = ({ aiChatRef }: EditorProps) => {
  const { selectedNote, updateNote } = useNotes()
  const { addSelectedText } = useChat()
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [showButton, setShowButton] = useState(false)
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 })

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedNote) {
      updateNote(selectedNote.id, {
        ...selectedNote,
        title: e.target.value,
      })
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedNote) {
      updateNote(selectedNote.id, {
        ...selectedNote,
        content: e.target.value,
      })
    }
  }

  const handleSelection = () => {
    const editor = editorRef.current
    if (!editor) return

    const selectedText = editor.value.substring(
      editor.selectionStart,
      editor.selectionEnd
    ).trim()

    if (selectedText) {
      const rect = editor.getBoundingClientRect()
      const lineHeight = parseInt(getComputedStyle(editor).lineHeight)
      const lines = selectedText.split("\n").length
      const scrollTop = editor.scrollTop

      setButtonPosition({
        top: rect.top + (lineHeight * lines) - scrollTop - 40,
        left: rect.left + (rect.width / 2) - 50,
      })
      setShowButton(true)
    } else {
      setShowButton(false)
    }
  }

  const handleAddToChat = () => {
    const editor = editorRef.current
    if (!editor) return

    const selectedText = editor.value.substring(
      editor.selectionStart,
      editor.selectionEnd
    ).trim()

    if (selectedText) {
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

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const selectedText = editor.value.substring(
          editor.selectionStart,
          editor.selectionEnd
        ).trim()
        
        if (selectedText) {
          addSelectedText(selectedText)
        }
      }
    }

    editor.addEventListener("mouseup", handleMouseUp)
    editor.addEventListener("keyup", handleKeyUp)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      editor.removeEventListener("mouseup", handleMouseUp)
      editor.removeEventListener("keyup", handleKeyUp)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [addSelectedText])

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
        <div className="p-4 space-y-4">
          <textarea
            ref={titleRef}
            className="w-full resize-none border-none bg-transparent text-2xl font-bold focus:outline-none"
            placeholder="제목을 입력하세요..."
            value={selectedNote?.title || ""}
            onChange={handleTitleChange}
          />
          <textarea
            ref={editorRef}
            className="w-full h-[calc(100vh-12rem)] resize-none border-none bg-transparent focus:outline-none"
            placeholder="내용을 입력하세요..."
            value={selectedNote?.content || ""}
            onChange={handleContentChange}
          />
          {showButton && (
            <div
              className="absolute bg-primary text-primary-foreground px-2 py-1 rounded-md shadow-lg"
              style={{
                top: buttonPosition.top,
                left: buttonPosition.left,
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={handleAddToChat}
              >
                <Plus className="size-3 mr-1" />
                Add to chat
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 