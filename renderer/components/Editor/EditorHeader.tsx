import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Note } from "@/lib/types"
import { useNotes } from "@/contexts/NoteContext"
import { useEffect, useRef } from "react"

export const EditorHeader = ({
  openedNotes,
  title,
  hasChanges,
  selectedNote,
  // onClose,
  selectNote,
}: {
  openedNotes: Note[];
  title: string;
  hasChanges: boolean;
  selectedNote: Note;
  // onClose: () => void;
  selectNote: (id: string) => void;
  
}) => {

  const { closeNote } = useNotes()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 선택된 탭이 변경될 때마다 스크롤 이동
  useEffect(() => {
    if (scrollContainerRef.current && selectedNote) {
      const selectedTab = scrollContainerRef.current.querySelector(`[data-note-id="${selectedNote.id}"]`)
      if (selectedTab) {
        selectedTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [selectedNote])

  const handleCloseEditor = (id: string) => {
    // 이게 현재 선택된거 아니고서 닫아버리면. 저장된것처럼 되는디..... 저장안돼있거등.....요...  
    if (hasChanges && id === selectedNote.id) {
      const response = confirm('저장되지 않은 변경사항이 있습니다. 저장하지 않고 진행하시겠습니까?')
      if (!response) return
    }
    closeNote(id)
  }

  const handleSelectNote = (id: string) => {
    
    if (hasChanges) {
      const response = confirm('저장되지 않은 변경사항이 있습니다. 저장하지 않고 진행하시겠습니까?')
      if (!response) return
    }
    selectNote(id)
  }



  return (
    <div className="flex items-center gap-2 ">
      <div ref={scrollContainerRef} className="flex-1 flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {openedNotes.map(note => (
          <div key={note.id} data-note-id={note.id}>
            <div className={cn("w-40 bg-background border-t border-l border-r rounded-t-md pl-6 pr-1 flex items-center text-xs h-8", note.id !== selectedNote.id && "bg-accent")}>
            <button
            onClick={() => handleSelectNote(note.id)}
            className="w-40 truncate text-left"
            > 
              {note.title ? note.title : note.filename}
              
              </button>
              <div className="flex-1 flex items-center">
                <TooltipProvider>
                  <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    'h-3 w-3 rounded-full transition-all duration-200 ml-2',
                    hasChanges && note.id === selectedNote.id ? 'bg-green-600/80' : 'bg-muted'
                  )}/>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{hasChanges && note.id === selectedNote.id ? '저장되지 않은 변경사항이 있습니다.' : '모든 변경사항이 저장되었습니다.'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="ml-auto">
            <Button 
            variant="ghost" size="icon" 
            className="bg-transparent hover:bg-transparent"
            onClick={() => handleCloseEditor(note.id)}
            >
            <X className="size-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
          </div>
        ))}
      </div>            
    </div>
  )
}