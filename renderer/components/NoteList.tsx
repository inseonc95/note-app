import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { FileText, Trash2, Plus } from "lucide-react"
import { useNotes } from "@/contexts/NoteContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function NoteList() {
  const { notes, selectedNote, selectNote, deleteNote, addNote } = useNotes()

  const handleAddNote = () => {
    addNote();
  };

  return (
    <>
    <div className="flex h-14 items-center border-b px-4">
      <h2 className="text-lg font-semibold">Notes</h2>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={handleAddNote}>
              <Plus className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>새 노트 만들기</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <div className="flex-1 overflow-hidden">
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
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>노트 삭제</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
    </>
  )
} 