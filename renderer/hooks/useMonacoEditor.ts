import { useRef } from "react"
import { Monaco } from "@monaco-editor/react"
import { editor } from "monaco-editor"

export const useMonacoEditor = (
  setMonacoEditorRef: (editor: editor.IStandaloneCodeEditor | null) => void,
  handler: {
    onSelectionChange: (position: { top: number, left: number }, hasSelection: boolean) => void,
    onAddToChat: () => void,
    onShowInlineChat: () => void,
  }

) => {
  /**
   * Monaco Editor 마운트 시 초기화 및 설정을 수행하는 함수
   * 
   * 이 함수는 Editor 컴포넌트가 마운트될 때 한 번만 호출되며,
   * 다음과 같은 초기화 및 설정 작업을 수행합니다:
   * 
   * 1. 에디터 참조 설정
   *    - editorRef를 통해 에디터 인스턴스를 외부에서 접근할 수 있도록 함
   *    - 이를 통해 다른 컴포넌트에서 에디터의 메서드를 호출할 수 있음
   * 
   * 2. 초기 포커스 설정
   *    - 에디터 마운트 직후 requestAnimationFrame을 사용하여
   *    - 에디터에 자동으로 포커스를 설정하여 사용자가 즉시 입력할 수 있도록 함
   * 
   * 3. 선택 변경 이벤트 처리
   *    - 사용자가 텍스트를 선택할 때마다 호출되는 이벤트 핸들러 설정
   *    - 선택된 텍스트가 있으면 버튼을 표시하고 위치를 업데이트
   *    - 선택된 텍스트가 없으면 버튼을 숨김
   *    - 버튼의 위치는 선택된 텍스트의 위치에 따라 동적으로 계산됨
   * 
   * 4. 단축키 설정
   *    - Command+I: 선택된 텍스트를 AI Chat에 추가하거나 AI Chat 패널을 토글
   *    - Command+K: InlineChat를 표시하고 텍스트를 선택
   * 
   * @param editor - Monaco Editor 인스턴스
   * @param monaco - Monaco Editor의 전역 객체
   * 
   * @sideEffects
   * - editorRef 상태 업데이트
   * - buttonPosition 상태 업데이트
   * - showToolbar 상태 업데이트
   * - 에디터의 이벤트 리스너 등록
   * - 에디터의 단축키 설정
   */
  const handleEditorMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    setMonacoEditorRef(editor)


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
      

      const buttonPosition = {
        top: rect.top + coords.top + 20,
        left: rect.left + coords.left,
      }
      handler.onSelectionChange(buttonPosition, !!selectedText.trim())
    })

    // Command+I 단축키 처리
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, handler.onAddToChat)

    // Command+K 단축키 처리
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, handler.onShowInlineChat)
  }


  return {
    handleEditorMount,
  }
}
