import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { FileText, Trash2 } from "lucide-react"
import { useNotes } from "@/contexts/NoteContext"

export function NoteList() {
  const { notes, selectedNote, selectNote, deleteNote } = useNotes()

  return (
    <ScrollArea className="h-[calc(100vh-3.5rem)]">
      <div className="space-y-2 p-2">
        {notes.map((note) => (
          <div
            key={note.id}
            className={cn(
              "group flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-background hover:text-accent-foreground",
              selectedNote?.id === note.id && "bg-background text-accent-foreground"
            )}
            onClick={() => selectNote(note.id)}
          >
            <FileText className="size-4 shrink-0" />
            <div className="flex-1 truncate">
              <div className="font-medium">{note.title}</div>
              <div className="text-xs text-muted-foreground">
                {note.updatedAt.toLocaleDateString()}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                deleteNote(note.id)
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 