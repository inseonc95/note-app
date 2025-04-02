import { useNotes } from "@/contexts/NoteContext"
import { useRef } from "react"

export function Editor() {
  const { selectedNote, updateNoteContent, updateNoteTitle } = useNotes()
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)

  if (!selectedNote) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center text-muted-foreground">
        Select a note or create a new one
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="flex-1 p-4">
        <textarea
          ref={titleRef}
          className="w-full mb-4 text-2xl font-bold resize-none bg-transparent outline-none h-[3rem] overflow-hidden"
          value={selectedNote.title}
          onChange={(e) => updateNoteTitle(selectedNote.id, e.target.value)}
          rows={1}
        />
        <textarea
          ref={editorRef}
          className="w-full h-[calc(100%-4rem)] resize-none bg-transparent p-4 text-lg outline-none overflow-auto"
          value={selectedNote.content}
          onChange={(e) => updateNoteContent(selectedNote.id, e.target.value)}
          placeholder="Start writing..."
        />
      </div>
    </div>
  )
} 