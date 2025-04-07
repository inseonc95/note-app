import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { FileText, Trash2, Plus, FolderOpen, Home, MoreVertical } from "lucide-react"
import { useNotes } from "@/contexts/NoteContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useEffect, useRef } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NoteList() {
  const { notes, selectedNote, selectNote, deleteNote, addNote, hasChanges, refreshNotes, unSelectNote } = useNotes()
  const [notesDir, setNotesDir] = useState<string>("")
  const [showDropdown, setShowDropdown] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadNotesDir = async () => {
      const dir = await window.note.getNotesDir()
      setNotesDir(dir)
    }
    loadNotesDir()
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        setShowDropdown(width < 200)
      }
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const handleAddNote = () => {
    if (hasChanges) {
      const response = confirm('저장되지 않은 변경사항이 있습니다. 저장하지 않고 진행하시겠습니까?')
      if (!response) return
    }
    addNote()
  }

  const handleChangeNotesDir = async () => {
    if (hasChanges) {
      const response = confirm('저장되지 않은 변경사항이 있습니다. 저장하지 않고 진행하시겠습니까?')
      if (!response) return
    }
    const newDir = await window.note.setNotesDir()
    if (newDir) {
      setNotesDir(newDir)
      unSelectNote()
      refreshNotes()
    }
  }

  const handleResetNotesDir = async () => {
    if (hasChanges) {
      const response = confirm('저장되지 않은 변경사항이 있습니다. 저장하지 않고 진행하시겠습니까?')
      if (!response) return
    }
    const defaultDir = await window.note.resetNotesDir()
    if (defaultDir) {
      setNotesDir(defaultDir)
      unSelectNote()
      refreshNotes()
    }
  }

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      <div className="flex h-8 items-center border-b px-4 mt-2">
        <h2 className="text-sm font-semibold">Notes</h2>

        <div className="ml-auto flex gap-2">
          {/* 데스크톱 버튼들 */}
          <div className={cn("flex gap-1", showDropdown && "hidden")}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleResetNotesDir}>
                    <Home className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>기본 경로로 변경</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleChangeNotesDir}>
                    <FolderOpen className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>노트 저장 폴더 변경</p>
                  <p className="text-xs text-muted-foreground mt-1">현재 경로: {notesDir}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleAddNote}>
                    <Plus className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>새 노트 만들기</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {/* 드롭다운 메뉴 */}
          <div className={cn("hidden", showDropdown && "block")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleResetNotesDir}>
                  <Home className="mr-2 size-4" />
                  기본 경로로 변경
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleChangeNotesDir}>
                  <FolderOpen className="mr-2 size-4" />
                  노트 저장 폴더 변경
                  <div className="text-xs text-muted-foreground mt-1">현재 경로: {notesDir}</div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAddNote}>
                  <Plus className="mr-2 size-4" />
                  새 노트 만들기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className={cn("flex-1 overflow-hidden", showDropdown && "hidden")}>
        <ScrollArea className="h-[calc(100vh-3.5rem)]">
          <div className="space-y-2 p-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-background hover:text-accent-foreground",
                  selectedNote?.id === note.id && "bg-background text-accent-foreground"
                )}
                onClick={() => {
                  if (hasChanges) {
                    const response = confirm('저장되지 않은 변경사항이 있습니다. 저장하지 않고 진행하시겠습니까?')
                    if (!response) return
                  }
                  selectNote(note.id)
                }}
              >
                <FileText className="size-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className={cn("font-medium truncate max-w-[110px]")}>{note.title ? note.title : note.filename}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (hasChanges) {
                      const response = confirm('저장되지 않은 변경사항이 있습니다. 저장하지 않고 진행하시겠습니까?')
                      if (!response) return
                    }
                    deleteNote(note.id)
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
} 