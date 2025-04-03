import { useNotes } from "@/contexts/NoteContext"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Command, Save } from "lucide-react"
import { useChat } from "@/contexts/ChatContext"
import Editor, { Monaco } from "@monaco-editor/react"
import { editor } from "monaco-editor"
import { cn } from "@/lib/utils"

export const NoteEditor = () => {
  const { selectedNote, updateNote } = useNotes()
  const { addSelectedText } = useChat()
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const [showButton, setShowButton] = useState(false)
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 })
  const [content, setContent] = useState(selectedNote?.content || "")
  const [title, setTitle] = useState(selectedNote?.title || "")
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setContent(selectedNote?.content || "")
    setTitle(selectedNote?.title || "")
    setHasChanges(false)
  }, [selectedNote])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasChanges, title, content, selectedNote])

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    setHasChanges(true)
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value)
      setHasChanges(true)
    }
  }

  const handleSave = () => {
    if (selectedNote && hasChanges) {
      updateNote(selectedNote.id, {
        title,
        content,
      })
      setHasChanges(false)
    }
  }

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor

    // 선택 변경 이벤트 처리
    editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getSelection()
      if (!selection) return

      const model = editor.getModel()
      if (!model) return

      const selectedText = model.getValueInRange(selection)
      
      if (selectedText.trim()) {
        const position = editor.getPosition()
        if (!position) return

        const coords = editor.getScrolledVisiblePosition(position)
        const editorElement = editor.getDomNode()
        const rect = editorElement.getBoundingClientRect()
        
        setButtonPosition({
          top: rect.top + coords.top + 20,
          left: rect.left + coords.left,
        })
        setShowButton(true)
      } else {
        setShowButton(false)
      }
    })

    // Command+K 단축키 처리
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      const selection = editor.getSelection()
      if (!selection) return

      const model = editor.getModel()
      if (!model) return

      const selectedText = model.getValueInRange(selection)
      if (selectedText.trim()) {
        addSelectedText(selectedText)
        setShowButton(false)
      }
    })
  }

  const handleAddToChat = () => {
    if (!editorRef.current) return

    const selection = editorRef.current.getSelection()
    if (!selection) return

    const model = editorRef.current.getModel()
    if (!model) return

    const selectedText = model.getValueInRange(selection)
    if (selectedText.trim()) {
      addSelectedText(selectedText)
      setShowButton(false)
    }
  }

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
        <div className="p-4 relative ">
          <div className="flex items-center gap-2 border-b ">
            <div className="flex-1 flex items-center ">
              <div className="bg-background border-t border-l border-r rounded-t-md px-6 flex items-center py-1 text-sm">
                {title}
                <div className={cn(
              'h-3 w-3 rounded-full transition-all duration-200 ml-2',
              hasChanges ? 'bg-green-600/80' : 'bg-muted'
            )}/>
              </div>
            </div>            
          </div>
          <div className="relative border-l border-r pt-5">
          <textarea
            ref={titleRef}
            className="w-full resize-none border-none bg-transparent text-2xl font-bold focus:outline-none h-8 px-6 "
            placeholder="제목을 입력하세요..."
            value={title}
            onChange={handleTitleChange}
          />
          </div>
          <div className="relative border-l border-r border-b">
            <Editor
              height="calc(100vh - 12rem)"
              defaultLanguage="markdown"
              value={content}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                lineNumbers: 'off',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                fontSize: 14,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
                renderWhitespace: 'none',
                padding: { top: 16, bottom: 16 },
              }}
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
                  <span>Add to chat</span>
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
    </div>
  )
} 