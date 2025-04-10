import { useRef, useState, useEffect } from "react"
import { useChat } from "@/contexts/ChatContext"
import Editor, { Monaco } from "@monaco-editor/react"
import { editor } from "monaco-editor"

import { EditorToolbar } from "./Editor/EditorToolbar"
import { EditorInlineChat } from "./Editor/EditorInlineChat"
import { EditorMetadata } from "./Editor/EditorMetadata"
import { EditorHeader } from "./Editor/EditorHeader"

import { useEditor } from "@/hooks/useEditor"

import { EDITOR_OPTIONS } from "@/lib/constants"
import { useMonacoEditor } from "@/hooks/useMonacoEditor"
import { useChatUI } from "@/contexts/ChatUIContext"
import { useNotes } from "@/contexts/NoteContext"

export const NoteEditor = ({ editorRef, setMonacoEditorRef }: { editorRef: React.RefObject<editor.IStandaloneCodeEditor>, setMonacoEditorRef: (editor: editor.IStandaloneCodeEditor | null) => void }) => {
  const { selectedNote, title, content, hasChanges, handleTitleChange, handleEditorChange, handleSave } = useEditor()

  const { openedNotes, selectNote } = useNotes()

  const { addSelectedText, setEditorRef } = useChat()
  const { hasApiKey } = useChatUI()
  const { isShowAIChat, toggleAIChat } = useChatUI()
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const [showToolbar, setShowToolbar] = useState(false)
  
  const isShowAIChatRef = useRef(isShowAIChat)
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 })

  const inlineChatRef = useRef<HTMLTextAreaElement>(null)
  const [inlineChatContent, setInlineChatContent] = useState("")
  const [showInlineChat, setShowInlineChat] = useState(false)
  const [inlineChatTargetContent, setInlineChatTargetContent] = useState("")
  
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    if (selectedNote && editorRef.current) {
      editorRef.current.focus()
    }
  }, [selectedNote, editorRef])

  /**
   * InlineChat의 키보드 이벤트 핸들러를 설정하는 useEffect
   * 
   * InlineChat가 표시된 상태(showInlineChat === true)에서 ESC 키를 누르면 
   * InlineChat를 닫고 관련 상태를 초기화하는 closeInlineChat 함수를 실행합니다.
   * 
   * @dependencies showInlineChat - InlineChat의 표시 상태를 감지하여 
   *              ESC 키 이벤트 핸들러를 조건부로 등록/해제합니다.
   * 
   * @sideEffects
   * - window 객체에 keydown 이벤트 리스너를 추가/제거합니다.
   * - ESC 키 입력 시 closeInlineChat 함수를 호출하여:
   *   - InlineChat의 내용(inlineChatContent)을 초기화
   *   - InlineChat의 표시 상태(showInlineChat)를 false로 설정
   *   - 미리보기 상태(showPreview)를 false로 설정
   *   - 에디터의 커서 위치를 복원하고 포커스를 설정
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showInlineChat) {
        closeInlineChat()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showInlineChat])

  /**
   * InlineChat의 포커스 관리를 위한 useEffect
   * 
   * InlineChat가 표시될 때(showInlineChat === true) InlineChat 내부의 textarea에
   * 자동으로 포커스를 설정하여 사용자가 즉시 텍스트를 입력할 수 있도록 합니다.
   * 
   * @dependencies showInlineChat - InlineChat의 표시 상태를 감지하여 포커스 처리를 수행
   * 
   * @sideEffects
   * - InlineChat가 표시될 때 inlineChatRef.current.focus()를 호출하여
   *   textarea에 포커스를 설정
   * - 이는 사용자 경험을 향상시키기 위한 것으로, InlineChat가 열리면
   *   사용자가 추가적인 클릭 없이 바로 텍스트를 입력할 수 있도록 함
   */
  useEffect(() => {
    if (showInlineChat && inlineChatRef.current) {
      inlineChatRef.current.focus()
    }
  }, [showInlineChat])


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
   * 선택된 텍스트를 AI Chat에 추가하는 함수
   * 
   * 이 함수는 다음과 같은 동작을 수행합니다:
   * 1. 에디터에서 현재 선택된 텍스트를 가져옴
   * 2. 선택된 텍스트가 있는 경우:
   *    - AI Chat 패널이 닫혀있으면 열기
   *    - 선택된 텍스트를 AI Chat에 추가
   *    - 선택 버튼 숨기기
   * 3. 선택된 텍스트가 없는 경우:
   *    - AI Chat 패널 토글 (열려있으면 닫고, 닫혀있으면 열기)
   * 
   * @sideEffects
   * - AI Chat 패널의 표시 상태 변경
   * - 선택된 텍스트를 AI Chat에 추가
   * - 선택 버튼의 표시 상태 변경
   */
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
      setShowToolbar(false)
    } else {
      toggleAIChat()
    }
  }

  /**
   * InlineChat를 표시하고 텍스트를 선택하는 함수
   * 
   * 이 함수는 다음과 같은 동작을 수행합니다:
   * 1. 텍스트가 선택된 경우:
   *    - 선택된 텍스트를 inlineChatTargetContent로 설정
   *    - InlineChat를 표시하고 포커스
   *    - 선택 버튼 숨기기
   * 
   * 2. 텍스트가 선택되지 않은 경우:
   *    - 현재 커서 위치부터 문서 끝까지 텍스트를 선택
   *    - 선택된 텍스트를 inlineChatTargetContent로 설정
   *    - InlineChat를 표시하고 포커스
   *    - 선택 버튼 숨기기
   * 
   * @sideEffects
   * - inlineChatTargetContent 상태 업데이트
   * - showInlineChat 상태를 true로 설정
   * - showToolbar 상태를 false로 설정
   * - InlineChat에 포커스 설정
   */
  const handleShowInlineChat = () => {
    if (!editorRef.current) return

    const selection = editorRef.current.getSelection()
    if (!selection) return

    const model = editorRef.current.getModel()
    if (!model) return

    const selectedText = model.getValueInRange(selection)
    if (selectedText.trim()) {
      setInlineChatTargetContent(selectedText)
      inlineChatRef.current?.focus()
      setShowInlineChat(true)
      setShowToolbar(false)
    } else {
      const position = editorRef.current.getPosition()
      if (!position) return

      // 현재 커서 위치부터 문서 끝까지 선택
      const endPosition = {
        lineNumber: model.getLineCount(),
        column: model.getLineMaxColumn(model.getLineCount())
      }
      
      editorRef.current.setSelection({
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: endPosition.lineNumber,
        endColumn: endPosition.column
      })

      const newSelectedText = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: endPosition.lineNumber,
        endColumn: endPosition.column
      })
      
      setInlineChatTargetContent(newSelectedText)
      setShowInlineChat(true)
      setShowToolbar(false)
      
      requestAnimationFrame(() => {
        inlineChatRef.current?.focus()
      })
    }
  }


  const updateSelectionToolbar = (position: { top: number, left: number }, hasSelection: boolean) => {
    if (hasSelection) {
      setButtonPosition(position)
      setShowToolbar(true)
    } else {
      setShowToolbar(false)
    }
  }

  const { handleEditorMount } = useMonacoEditor(setMonacoEditorRef, {
    onSelectionChange: updateSelectionToolbar,
    onAddToChat: handleAddToChat,
    onShowInlineChat: handleShowInlineChat,
  })


  if (!selectedNote) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        노트를 선택하거나 새로 만들어주세요
      </div>
    )
  }

  /**
   * InlineChat를 닫고 관련 상태를 초기화하는 함수
   * 
   * InlineChat를 닫을 때 다음 작업들을 수행합니다:
   * 1. InlineChat의 내용(inlineChatContent)을 빈 문자열로 초기화
   * 2. InlineChat의 표시 상태(showInlineChat)를 false로 설정하여 숨김
   * 3. 미리보기 상태(showPreview)를 false로 설정하여 미리보기 모드 종료
   * 4. 에디터의 커서 위치를 복원하고 포커스를 설정하여 사용자가 계속 편집할 수 있도록 함
   * 
   * @sideEffects
   * - inlineChatContent 상태를 초기화
   * - showInlineChat 상태를 false로 설정
   * - showPreview 상태를 false로 설정
   * - 에디터의 커서 위치와 포커스를 복원
   */
  const closeInlineChat = () => {
    setInlineChatContent("")
    setShowInlineChat(false)
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
   * InlineChat의 수정 내용을 AI Chat에 제출하고 응답을 처리하는 함수
   * 
   * 이 함수는 다음과 같은 순서로 동작합니다:
   * 1. API 키 검증
   *    - API 키가 없는 경우:
   *      - InlineChat를 닫음
   *      - AI Chat 패널이 닫혀있으면 열기
   *      - API 키 등록 알림 표시
   * 
   * 2. AI Chat 요청 및 응답 처리
   *    - inlineChatContent를 사용자 메시지로 전송
   *    - editTargetContent를 컨텍스트로 제공
   *    - 응답을 받아 inlineChatContent를 업데이트
   *    - showPreview를 true로 설정하여 미리보기 모드 활성화
   * 
   * @param e - React의 FormEvent 객체로, 폼 제출 이벤트 정보를 포함
   * 
   * @sideEffects
   * - API 키가 없는 경우:
   *   - InlineChat 닫기
   *   - AI Chat 패널 토글
   *   - 알림 표시
   * - API 키가 있는 경우:
   *   - AI Chat에 메시지 전송
   *   - inlineChatContent 상태 업데이트
   *   - showPreview 상태를 true로 설정
   * 
   * @note
   * - Enter 키로도 제출 가능 (Shift+Enter는 줄바꿈)
   * - 응답을 받으면 자동으로 미리보기 모드로 전환
   */
  const handleInlineChatSubmit = async (e: React.FormEvent) => {
    if (!hasApiKey) {
      closeInlineChat()
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
          content: inlineChatContent
        },
      ], 
      inlineChatTargetContent
    )
    setInlineChatContent(response)
    setShowPreview(true)
  }

  /**
   * 미리보기 모드에서 수정된 내용을 에디터에 적용하는 함수
   * 
   * showPreview 상태에서 체크 버튼을 클릭했을 때 호출되며,
   * AI Chat의 응답으로 생성된 inlineChatContent를 현재 커서 위치에 삽입합니다.
   * 
   * @sideEffects
   * - 현재 커서 위치에 editBoxContent를 삽입
   * - forceMoveMarkers: true로 설정하여 삽입된 텍스트가 에디터의 마커를 강제로 이동시킴
   * - 삽입 후 InlineChat를 닫고 관련 상태를 초기화
   * 
   * @note
   * - 에디터가 마운트되지 않았거나 커서 위치가 없는 경우 함수를 조기 종료
   * - pushEditOperations를 사용하여 삽입 작업을 undo 스택에 추가하여
   *   사용자가 필요시 변경사항을 취소할 수 있도록 함
   */
  const handleApplyPreview = () => {
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
            text: `\n${inlineChatContent}\n`,
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
              text: `\n${inlineChatContent}\n`,
              forceMoveMarkers: true
            }],
            () => null
          )
        }
      }
    }

    closeInlineChat()
  }

  return (
    <div className="flex h-full flex-col">
      {/* {openedNotes.map(note => (
        <div key={note.id}>
          {note.title}
        </div>
      ))} */}
      <div className="flex-1 overflow-hidden">
        <div className="p-2 relative ">
          <EditorHeader
            openedNotes={openedNotes}
            title={title}
            hasChanges={hasChanges}
            selectedNote={selectedNote}
            // onClose={closeEditor}
            selectNote={selectNote}
          />
          <div className="border rounded-r-md rounded-bl-md">
            <div className="relative pt-5">
              {selectedNote?.title != "" && (
                <textarea
                ref={titleRef}
                className="w-full resize-none border-none bg-transparent text-xl font-bold focus:outline-none h-8 px-6 "
                placeholder="제목을 입력하세요. 빈 제목 저장 시 재설정이 불가능합니다."
                value={title}
                onChange={handleTitleChange}
                />
              )}
              <EditorMetadata
                selectedNote={selectedNote}
              />
            </div>
            <div className="relative p-1">
              <Editor
                height="calc(100vh - 16rem)"
                defaultLanguage="markdown"
                value={content}
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                options={EDITOR_OPTIONS}
              />
            <div className="h-[4rem]">
            </div>
              {showInlineChat && (
                <EditorInlineChat
                  position={buttonPosition}
                  showPreview={showPreview}
                  inlineChatRef={inlineChatRef}
                  inlineChatContent={inlineChatContent}
                  inlineChatTargetContent={inlineChatTargetContent}
                  onSubmit={handleInlineChatSubmit}
                  onChange={setInlineChatContent}
                  onApply={handleApplyPreview}
                  onClose={closeInlineChat}
                />
              )}
              {showToolbar && (
                <EditorToolbar
                  position={buttonPosition}
                  handleAddToChat={handleAddToChat}
                  handleShowInlineChat={handleShowInlineChat}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 