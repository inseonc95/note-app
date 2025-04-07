import { useNotes } from "@/contexts/NoteContext"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Command, X, Send, Check } from "lucide-react"
import { useChat } from "@/contexts/ChatContext"
import Editor, { Monaco } from "@monaco-editor/react"
import { editor } from "monaco-editor"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


export const NoteEditor = () => {
  const { selectedNote, updateNote, unSelectNote, hasChanges, setHasChanges } = useNotes()
  const { addSelectedText, setEditorRef } = useChat()
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const [showButton, setShowButton] = useState(false)
  
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 })
  const [content, setContent] = useState(selectedNote?.content || "")
  const [title, setTitle] = useState(selectedNote?.title || "")

  const editBoxRef = useRef<HTMLTextAreaElement>(null)
  const [editBoxContent, setEditBoxContent] = useState("")
  const [editTargetContent, setEditTargetContent] = useState("")
  const [showEditBox, setShowEditBox] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEditBox) {
        closeEditBox()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showEditBox])

  useEffect(() => {
    if (showEditBox && editBoxRef.current) {
      editBoxRef.current.focus()
    }
  }, [showEditBox])

  useEffect(() => {
    setContent(selectedNote?.content || "")
    setTitle(selectedNote?.title || "")
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

  useEffect(() => {
    setEditorRef({
      handleApply: (content: string) => {
        if (!editorRef.current) return
        const selection = editorRef.current.getSelection()
        if (selection) {
          const model = editorRef.current.getModel()
          if (model) {
            model.pushEditOperations(
              [],
              [{
                range: {
                  startLineNumber: selection.endLineNumber,
                  startColumn: selection.endColumn,
                  endLineNumber: selection.endLineNumber,
                  endColumn: selection.endColumn
                },
                text: `\n${content}\n`,
                forceMoveMarkers: true
              }],
              () => null
            )
          }
        } else {
          // 선택된 텍스트가 없는 경우, 현재 커서 위치에 삽입
          const currentPosition = editorRef.current.getPosition()
          if (currentPosition) {
            const model = editorRef.current.getModel()
            if (model) {
              model.pushEditOperations(
                [],
                [{
                  range: {
                    startLineNumber: currentPosition.lineNumber,
                    startColumn: currentPosition.column,
                    endLineNumber: currentPosition.lineNumber,
                    endColumn: currentPosition.column
                  },
                  text: `\n${content}\n`,
                  forceMoveMarkers: true
                }],
                () => null
              )
            }
          }
        }

        if (editorRef.current) {
          const position = editorRef.current.getPosition()
          if (position) {
            editorRef.current.setPosition(position)
            editorRef.current.focus()
          }
        }
      }
    })
    return () => {
      setEditorRef(null)
    }
  }, [setEditorRef])

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value.trim()
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
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
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


    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      const selection = editor.getSelection()
      if (!selection) return

      const model = editor.getModel()
      if (!model) return

      const selectedText = model.getValueInRange(selection)
      if (selectedText.trim()) {
        setEditTargetContent(selectedText)
        editBoxRef.current?.focus()
        setShowEditBox(true)
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

  const closeEditBox = () => {
    setEditBoxContent("")
    setShowEditBox(false)
    setShowPreview(false)
    if (editorRef.current) {
      const position = editorRef.current.getPosition()
      if (position) {
        editorRef.current.setPosition(position)
        editorRef.current.focus()
      }
    }
  }

  const handleEditBoxSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowPreview(true)
  }

  const handleApply = () => {
    if (!editorRef.current) return

    const position = editorRef.current.getPosition()
    if (!position) return

    const model = editorRef.current.getModel()
    if (!model) return

    // 현재 편집을 undo 스택에 추가
    model.pushEditOperations(
      [],
      [{
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        },
        text: editBoxContent,
        forceMoveMarkers: true
      }],
      () => null
    )

    closeEditBox()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="p-2 relative ">
          <div className="flex items-center gap-2 ">
            <div className="flex-1 flex items-center">
              <div className="bg-background border-t border-l border-r rounded-t-md pl-6 pr-1 flex items-center text-xs h-8">
                {title ? title : selectedNote.filename}
                <div className="flex-1 flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          'h-3 w-3 rounded-full transition-all duration-200 ml-2',
                          hasChanges ? 'bg-green-600/80' : 'bg-muted'
                        )}/>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{hasChanges ? '저장되지 않은 변경사항이 있습니다.' : '모든 변경사항이 저장되었습니다.'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="ml-auto">
                  <Button 
                  variant="ghost" size="icon" 
                  className="bg-transparent hover:bg-transparent"
                  onClick={()=> {
                    if (hasChanges) {
                      const response = confirm('저장되지 않은 변경사항이 있습니다. 저장하지 않고 진행하시겠습니까?')
                      if (!response) return
                    }
                    unSelectNote()
                  }}>
                    <X className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>            
          </div>
          <div
          className="border rounded-r-md rounded-bl-md"
          >
          <div className="relative pt-5">
            {selectedNote?.title != "" && (
                        <textarea
                        ref={titleRef}
                        className="w-full resize-none border-none bg-transparent text-xl font-bold focus:outline-none h-8 px-6 "
                        placeholder="제목을 입력하세요. 빈 제목 저장 시 재설정이 불가능합니다."
                        value={title}
                        onChange={handleTitleChange}
                        // readOnly={title ? false : true}
                      />
            )}

          <p className="text-xs text-muted-foreground px-6">
            파일 이름: {selectedNote.filename}.md
          </p>
          <p className="text-xs text-muted-foreground px-6">
            생성 일시 {new Date(selectedNote.createdAt).toLocaleDateString() + " " + new Date(selectedNote.createdAt).toLocaleTimeString()}
          </p>
          <p className="text-xs text-muted-foreground px-6">
            수정 일시 {new Date(selectedNote.updatedAt).toLocaleDateString() + " " + new Date(selectedNote.updatedAt).toLocaleTimeString()}
          </p>
          </div>
          <div className="relative p-1">
            <Editor
              height="calc(100vh - 11rem)"
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
            {showEditBox && (
              <div
                className="fixed z-50 p-2 bg-accent rounded-md shadow-lg"
                style={{
                  top: `${buttonPosition.top}px`,
                  left: `${buttonPosition.left}px`,
                  width: '400px',
                }}
              >
                {!showPreview ? (
                  <form onSubmit={handleEditBoxSubmit} className="flex items-center gap-2 bg-background rounded-md p-2">
                    <textarea 
                      ref={editBoxRef}
                      className="w-full resize-none border-none text-xs font-bold focus:outline-none h-[17px]"
                      placeholder="수정하세요"
                      value={editBoxContent}
                      onChange={(e) => setEditBoxContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleEditBoxSubmit(e)
                        }
                      }}
                    />
                    <Button type="submit" size="icon" className="h-6 w-6">
                      <Send className="size-3" />
                    </Button>
                  </form>
                ) : (
                  <div className="flex flex-col gap-2 bg-background rounded-md p-2">
                    <div className="flex flex-col gap-1">
                      <div className="text-xs text-muted-foreground">원본: {editTargetContent}</div>
                      <div className="text-xs text-green-600">{editBoxContent}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <Button 
                          type="button" 
                          size="icon" 
                          className="h-6 w-6"
                          variant="outline"
                          onClick={handleApply}
                        >
                          <Check className="size-3" />
                        </Button>
                        <Button 
                          type="button" 
                          size="icon" 
                          className="h-6 w-6"
                          variant="outline"
                          onClick={closeEditBox}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
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
                  <span>chat</span>
                </Button>
                <span className="text-muted-foreground">|</span> 
                <Button
                  size="sm"
                  className="h-6 text-xs"
                  onClick={handleAddToChat}
                >
                  <span>Edit</span>
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
    </div>
  )
} 