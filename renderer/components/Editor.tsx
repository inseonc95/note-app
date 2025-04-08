import { useNotes } from "@/contexts/NoteContext"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Command, X, Send, Check } from "lucide-react"
import { useChat } from "@/contexts/ChatContext"
import Editor, { Monaco } from "@monaco-editor/react"
import { editor } from "monaco-editor"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


export const NoteEditor = ({ editorRef, setMonacoEditorRef }: { editorRef: React.RefObject<editor.IStandaloneCodeEditor>, setMonacoEditorRef: (editor: editor.IStandaloneCodeEditor | null) => void }) => {
  const { selectedNote, updateNote, unSelectNote, hasChanges, setHasChanges } = useNotes()
  const { addSelectedText, setEditorRef, isShowAIChat, toggleAIChat, hasApiKey } = useChat()
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const [showButton, setShowButton] = useState(false)
  const isShowAIChatRef = useRef(isShowAIChat)
  
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 })
  const [content, setContent] = useState(selectedNote?.content || "")
  const [title, setTitle] = useState(selectedNote?.title || "")

  const editBoxRef = useRef<HTMLTextAreaElement>(null)
  const [editBoxContent, setEditBoxContent] = useState("")
  const [editTargetContent, setEditTargetContent] = useState("")
  const [showEditBox, setShowEditBox] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  /**
   * EditBox의 키보드 이벤트 핸들러를 설정하는 useEffect
   * 
   * EditBox가 표시된 상태(showEditBox === true)에서 ESC 키를 누르면 
   * EditBox를 닫고 관련 상태를 초기화하는 closeEditBox 함수를 실행합니다.
   * 
   * @dependencies showEditBox - EditBox의 표시 상태를 감지하여 
   *              ESC 키 이벤트 핸들러를 조건부로 등록/해제합니다.
   * 
   * @sideEffects
   * - window 객체에 keydown 이벤트 리스너를 추가/제거합니다.
   * - ESC 키 입력 시 closeEditBox 함수를 호출하여:
   *   - EditBox의 내용(editBoxContent)을 초기화
   *   - EditBox의 표시 상태(showEditBox)를 false로 설정
   *   - 미리보기 상태(showPreview)를 false로 설정
   *   - 에디터의 커서 위치를 복원하고 포커스를 설정
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEditBox) {
        closeEditBox()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showEditBox])

  /**
   * EditBox의 포커스 관리를 위한 useEffect
   * 
   * EditBox가 표시될 때(showEditBox === true) EditBox 내부의 textarea에
   * 자동으로 포커스를 설정하여 사용자가 즉시 텍스트를 입력할 수 있도록 합니다.
   * 
   * @dependencies showEditBox - EditBox의 표시 상태를 감지하여 포커스 처리를 수행
   * 
   * @sideEffects
   * - EditBox가 표시될 때 editBoxRef.current.focus()를 호출하여
   *   textarea에 포커스를 설정
   * - 이는 사용자 경험을 향상시키기 위한 것으로, EditBox가 열리면
   *   사용자가 추가적인 클릭 없이 바로 텍스트를 입력할 수 있도록 함
   */
  useEffect(() => {
    if (showEditBox && editBoxRef.current) {
      editBoxRef.current.focus()
    }
  }, [showEditBox])

  /**
   * 노트 데이터 동기화를 위한 useEffect
   * 
   * 이 useEffect는 다음 두 가지 상황에서 실행됩니다:
   * 1. 컴포넌트의 최초 마운트 시점
   * 2. selectedNote가 변경될 때 (다른 노트를 선택했을 때)
   * 
   * 이는 사용자가 직접 수정하는 handleTitleChange/handleEditorChange와는
   * 다른 시점에 실행되는 별개의 동작입니다:
   * - handleTitleChange/handleEditorChange: 사용자의 직접적인 입력에 반응
   * - 이 useEffect: 노트 선택 변경에 반응
   * 
   * @dependencies selectedNote - 현재 선택된 노트 객체
   * 
   * @sideEffects
   * - content 상태를 selectedNote.content로 초기화/업데이트
   * - title 상태를 selectedNote.title로 초기화/업데이트
   */
  useEffect(() => {
    setContent(selectedNote?.content || "")
    setTitle(selectedNote?.title || "")
  }, [selectedNote])

  /**
   * 저장 단축키(cmd+s) 이벤트 핸들러를 설정하는 useEffect
   * 
   * 사용자가 cmd+s를 누르면 현재 노트의 변경사항을 저장합니다.
   * 이는 다음과 같은 상태 변화의 순환을 가집니다:
   * 
   * 1. handleTitleChange/handleEditorChange에서:
   *    - title이나 content가 변경될 때마다 hasChanges를 true로 설정
   * 
   * 2. handleSave에서:
   *    - hasChanges가 true이고 selectedNote가 있을 때만 저장 실행
   *    - 저장 후 hasChanges를 false로 설정하여 변경사항이 저장되었음을 표시
   * 
   * @dependencies
   * - hasChanges: 저장이 필요한 변경사항이 있는지 여부
   * - title: 현재 노트의 제목
   * - content: 현재 노트의 내용
   * - selectedNote: 현재 선택된 노트 객체
   * 
   * @sideEffects
   * - window 객체에 keydown 이벤트 리스너를 추가/제거
   * - cmd+s 입력 시 handleSave 함수를 호출하여:
   *   - 현재 노트의 title과 content를 업데이트
   *   - hasChanges 상태를 false로 설정
   */
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

  /**
   * AI Chat 패널의 표시 상태를 Editor 컴포넌트와 동기화하는 useEffect
   * 
   * AI Chat 패널의 표시 상태(isShowAIChat)가 변경될 때마다
   * Editor 컴포넌트 내부의 ref(isShowAIChatRef)에 해당 상태를 업데이트합니다.
   * 
   * 이는 Editor 컴포넌트가 AI Chat 패널의 상태를 직접 참조하지 않고,
   * ref를 통해 간접적으로 접근할 수 있도록 하기 위함입니다.
   * 
   * @dependencies isShowAIChat - AI Chat 패널의 표시 상태
   * 
   * @sideEffects
   * - isShowAIChatRef.current를 isShowAIChat 값으로 업데이트
   * - 이를 통해 Editor 컴포넌트는 AI Chat 패널의 상태를
   *   ref를 통해 안전하게 참조할 수 있음
   * 
   * @note
   * - ref를 사용하는 이유는 Editor 컴포넌트의 다른 부분에서
   *   AI Chat 패널의 상태를 참조할 때 최신 상태를 보장하기 위함
   * - 특히 이벤트 핸들러나 콜백 함수 내에서 사용될 때 유용
   */
  useEffect(() => {
    isShowAIChatRef.current = isShowAIChat
  }, [isShowAIChat])

  /**
   * AI Chat 패널과 에디터 간의 상호작용을 위한 useEffect
   * 
   * 이 useEffect는 AI Chat 패널에서 에디터의 내용을 수정할 수 있도록
   * handleApply 함수를 설정합니다. 이 함수는 두 가지 경우를 처리합니다:
   * 
   * 1. 텍스트가 선택된 경우 (selection이 있는 경우):
   *    - 선택된 텍스트의 끝 위치에 새로운 내용을 삽입
   *    - 이는 사용자가 특정 부분을 선택하고 AI Chat의 응답을 그 위치에 삽입하고자 할 때 사용
   * 
   * 2. 텍스트가 선택되지 않은 경우 (selection이 없는 경우):
   *    - 현재 커서 위치에 새로운 내용을 삽입
   *    - 이는 사용자가 특정 위치를 지정하지 않고 AI Chat의 응답을 현재 위치에 삽입하고자 할 때 사용
   * 
   * @dependencies setEditorRef - AI Chat 패널에서 사용할 에디터 참조를 설정하는 함수
   * 
   * @sideEffects
   * - AI Chat 패널에서 사용할 handleApply 함수를 설정
   * - 컴포넌트 언마운트 시 editorRef를 null로 초기화
   * 
   * @note
   * - handleApply 함수는 AI Chat 패널의 applyToEditor 메서드에서 호출됨
   * - forceMoveMarkers: true는 삽입된 텍스트가 에디터의 마커를 강제로 이동시킴
   * - 모든 경우에 삽입 후 에디터의 포커스를 복원하여 사용자가 계속 편집할 수 있도록 함
   */
  useEffect(() => {
    setEditorRef({
      handleApply: (content: string) => {
        if (!editorRef.current) return
        const selection = editorRef.current.getSelection()
        if (selection) {
          // 선택된 텍스트가 있는 경우: 선택된 텍스트의 끝 위치에 삽입
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
          // 선택된 텍스트가 없는 경우: 현재 커서 위치에 삽입
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

        // 삽입 후 에디터의 포커스 복원
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

  /**
   * 노트 제목 변경을 처리하는 이벤트 핸들러
   * 
   * 사용자가 제목을 수정할 때마다 호출되며, 다음 작업을 수행합니다:
   * 1. 입력된 제목의 앞뒤 공백을 제거하여 정규화
   * 2. 정규화된 제목을 title 상태에 업데이트
   * 3. 변경사항이 있음을 표시하기 위해 hasChanges를 true로 설정
   * 
   * @param e - React의 ChangeEvent 객체로, textarea의 변경 이벤트 정보를 포함
   * @sideEffects
   * - title 상태 업데이트
   * - hasChanges 상태를 true로 설정하여 저장이 필요함을 표시
   */
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value.trim()
    setTitle(newTitle)
    setHasChanges(true)
  }

  /**
   * 에디터 내용 변경을 처리하는 이벤트 핸들러
   * 
   * Monaco Editor의 내용이 변경될 때마다 호출되며, 다음 작업을 수행합니다:
   * 1. 새로운 내용이 undefined가 아닌 경우에만 처리
   * 2. 새로운 내용을 content 상태에 업데이트
   * 3. 변경사항이 있음을 표시하기 위해 hasChanges를 true로 설정
   * 
   * @param value - Monaco Editor에서 변경된 새로운 내용
   *              undefined인 경우는 무시 (에디터 초기화 시 등)
   * @sideEffects
   * - content 상태 업데이트
   * - hasChanges 상태를 true로 설정하여 저장이 필요함을 표시
   */
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value)
      setHasChanges(true)
    }
  }

  /**
   * 현재 노트의 변경사항을 저장하는 함수
   * 
   * cmd+s 단축키나 저장 버튼을 통해 호출되며, 다음 작업을 수행합니다:
   * 1. 현재 선택된 노트가 있고 변경사항이 있는 경우에만 저장 실행
   * 2. 선택된 노트의 id를 사용하여 title과 content를 업데이트
   * 3. 저장 완료 후 hasChanges를 false로 설정하여 변경사항이 저장되었음을 표시
   * 
   * @sideEffects
   * - updateNote를 통해 노트의 내용을 업데이트
   * - hasChanges 상태를 false로 설정하여 저장 완료 표시
   * 
   * @note
   * - selectedNote가 없거나 hasChanges가 false인 경우 저장을 수행하지 않음
   * - 저장 후 hasChanges를 false로 설정하여 불필요한 저장 방지
   */
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
    setMonacoEditorRef(editor)

    // 초기 마운트 시 포커스 설정
    requestAnimationFrame(() => {
      editor.focus()
    })

    // 선택 변경 이벤트 처리
    editor.onDidChangeCursorSelection((e) => {
      const selection = editor.getSelection()
      if (!selection) return

      const model = editor.getModel()
      if (!model) return

      const selectedText = model.getValueInRange(selection)
      const position = editor.getPosition()
      if (!position) return

      const coords = editor.getScrolledVisiblePosition(position)
      const editorElement = editor.getDomNode()
      const rect = editorElement.getBoundingClientRect()
      
      setButtonPosition({
        top: rect.top + coords.top + 20,
        left: rect.left + coords.left,
      })
      if (selectedText.trim()) {

        setShowButton(true)
      } else {
        setShowButton(false)
      }
    })

    // Command+I 단축키 처리
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
      const selection = editor.getSelection()
      if (!selection) return

      const model = editor.getModel()
      if (!model) return

      const selectedText = model.getValueInRange(selection)
      if (selectedText.trim()) {
        if (!isShowAIChatRef.current) {
          toggleAIChat()
        }
        
        addSelectedText(selectedText)
        setShowButton(false)
      } else {
        toggleAIChat()
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
      } else {
        // 여기서 커서 아래에 모든 텍스트를 하이라이트처리
        const position = editor.getPosition()
        if (!position) return
        const model = editor.getModel()
        if (!model) return

        
        // 현재 커서 위치부터 문서 끝까지 선택
        const endPosition = {
          lineNumber: model.getLineCount(),
          column: model.getLineMaxColumn(model.getLineCount())
        }
        
        editor.setSelection({
          startLineNumber: endPosition.lineNumber,
          startColumn: endPosition.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        })

        // 선택된 텍스트를 가져와서 editBox에 표시
        const newSelectedText = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: endPosition.lineNumber,
          endColumn: endPosition.column
        })
        
        setEditTargetContent(newSelectedText)
        setShowEditBox(true)
        setShowButton(false)
        
        // 다음 프레임에서 editBox에 포커스
        requestAnimationFrame(() => {
          editBoxRef.current?.focus()
        })
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
      if (!isShowAIChatRef.current) {
        toggleAIChat()
      }


      addSelectedText(selectedText)
      setShowButton(false)
    } else {
      toggleAIChat()
    }
  }

  if (!selectedNote) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        노트를 선택하거나 새로 만들어주세요
      </div>
    )
  }

  /**
   * EditBox를 닫고 관련 상태를 초기화하는 함수
   * 
   * EditBox를 닫을 때 다음 작업들을 수행합니다:
   * 1. EditBox의 내용(editBoxContent)을 빈 문자열로 초기화
   * 2. EditBox의 표시 상태(showEditBox)를 false로 설정하여 숨김
   * 3. 미리보기 상태(showPreview)를 false로 설정하여 미리보기 모드 종료
   * 4. 에디터의 커서 위치를 복원하고 포커스를 설정하여 사용자가 계속 편집할 수 있도록 함
   * 
   * @sideEffects
   * - editBoxContent 상태를 초기화
   * - showEditBox 상태를 false로 설정
   * - showPreview 상태를 false로 설정
   * - 에디터의 커서 위치와 포커스를 복원
   */
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

  /**
   * EditBox의 수정 내용을 AI Chat에 제출하고 응답을 처리하는 함수
   * 
   * 이 함수는 다음과 같은 순서로 동작합니다:
   * 1. API 키 검증
   *    - API 키가 없는 경우:
   *      - EditBox를 닫음
   *      - AI Chat 패널이 닫혀있으면 열기
   *      - API 키 등록 알림 표시
   * 
   * 2. AI Chat 요청 및 응답 처리
   *    - editBoxContent를 사용자 메시지로 전송
   *    - editTargetContent를 컨텍스트로 제공
   *    - 응답을 받아 editBoxContent를 업데이트
   *    - showPreview를 true로 설정하여 미리보기 모드 활성화
   * 
   * @param e - React의 FormEvent 객체로, 폼 제출 이벤트 정보를 포함
   * 
   * @sideEffects
   * - API 키가 없는 경우:
   *   - EditBox 닫기
   *   - AI Chat 패널 토글
   *   - 알림 표시
   * - API 키가 있는 경우:
   *   - AI Chat에 메시지 전송
   *   - editBoxContent 상태 업데이트
   *   - showPreview 상태를 true로 설정
   * 
   * @note
   * - Enter 키로도 제출 가능 (Shift+Enter는 줄바꿈)
   * - 응답을 받으면 자동으로 미리보기 모드로 전환
   */
  const handleEditBoxSubmit = async (e: React.FormEvent) => {
    if (!hasApiKey) {
      closeEditBox()
      if (!isShowAIChat) {
        toggleAIChat()
      }
      alert("API 키를 등록해주세요.")
      return
    }
    e.preventDefault()
    const response = await window.chat.sendMessage(
      [
        {
          role: "user",
          content: editBoxContent
        },
      ], 
      editTargetContent
    )
    setEditBoxContent(response)
    setShowPreview(true)
  }

  /**
   * 미리보기 모드에서 수정된 내용을 에디터에 적용하는 함수
   * 
   * showPreview 상태에서 체크 버튼을 클릭했을 때 호출되며,
   * AI Chat의 응답으로 생성된 editBoxContent를 현재 커서 위치에 삽입합니다.
   * 
   * @sideEffects
   * - 현재 커서 위치에 editBoxContent를 삽입
   * - forceMoveMarkers: true로 설정하여 삽입된 텍스트가 에디터의 마커를 강제로 이동시킴
   * - 삽입 후 EditBox를 닫고 관련 상태를 초기화
   * 
   * @note
   * - 에디터가 마운트되지 않았거나 커서 위치가 없는 경우 함수를 조기 종료
   * - pushEditOperations를 사용하여 삽입 작업을 undo 스택에 추가하여
   *   사용자가 필요시 변경사항을 취소할 수 있도록 함
   */
  const handleApplyPreview = () => {
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
                          onClick={handleApplyPreview}
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