import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { FileText, Trash2, Plus, FolderOpen, Home, MoreVertical } from "lucide-react"
import { useNotes } from "@/contexts/NoteContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NoteList() {
  const { notes, selectedNote, selectNote, deleteNote, addNote } = useNotes()
  const [notesDir, setNotesDir] = useState<string>("")

  useEffect(() => {
    const loadNotesDir = async () => {
      const dir = await window.note.getNotesDir()
      setNotesDir(dir)
    }
    loadNotesDir()
  }, [])

  const handleAddNote = () => {
    addNote()
  }

  const handleChangeNotesDir = async () => {
    const newDir = await window.note.setNotesDir()
    if (newDir) {
      setNotesDir(newDir)
      // 노트 목록 새로고침
      window.location.reload()
    }
  }

  const handleResetNotesDir = async () => {
    const defaultDir = await window.note.resetNotesDir()
    if (defaultDir) {
      setNotesDir(defaultDir)
      // 노트 목록 새로고침
      window.location.reload()
    }
  }

  return (
    <>
    <div className="flex h-14 items-center border-b px-4">
      <h2 className="text-lg font-semibold">Notes</h2>
      <div className="ml-auto flex gap-2">
        {/* 데스크톱 버튼들 */}
        <div className="hidden md:flex gap-1">
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
        {/* 모바일 드롭다운 메뉴 */}
        <div className="md:hidden">
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
                <div className="font-medium">{note.title ? note.title : note.filename}</div>
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