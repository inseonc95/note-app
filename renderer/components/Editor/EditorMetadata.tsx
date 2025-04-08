import { Note } from "@/lib/types"

export const EditorMetadata = ({
  selectedNote,
}: {
  selectedNote: Note;
}) => {
  return (
    <>
    <p className="text-xs text-muted-foreground px-6">
      파일 이름: {selectedNote.filename}.md
    </p>
    <p className="text-xs text-muted-foreground px-6">
      생성 일시 {new Date(selectedNote.createdAt).toLocaleDateString() + " " + new Date(selectedNote.createdAt).toLocaleTimeString()}
    </p>
    <p className="text-xs text-muted-foreground px-6">
      수정 일시 {new Date(selectedNote.updatedAt).toLocaleDateString() + " " + new Date(selectedNote.updatedAt).toLocaleTimeString()}
    </p>
    </>
  )
}