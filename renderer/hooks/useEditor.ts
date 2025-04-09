import { useState, useEffect } from "react"
import { useNotes } from "../contexts/NoteContext"

export const useEditor = () => {
  const { selectedNote, updateNote, unSelectNote, hasChanges, setHasChanges } = useNotes()
  const [content, setContent] = useState(selectedNote?.content || "")
  const [title, setTitle] = useState(selectedNote?.title || "")

  
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
    }
  }


  const closeEditor = () => {
    if (hasChanges) {
      const response = confirm('저장되지 않은 변경사항이 있습니다. 저장하지 않고 진행하시겠습니까?')
      if (!response) return
    }
    unSelectNote()
  }

  return {
    selectedNote,
    title,
    setTitle,
    content,
    setContent,
    hasChanges,
    handleTitleChange,
    handleEditorChange,
    handleSave,
    closeEditor,
  }
}
