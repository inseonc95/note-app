import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Note } from "@/lib/types"

export const EditorHeader = ({
  title,
  hasChanges,
  selectedNote,
  onClose,
}: {
  title: string;
  hasChanges: boolean;
  selectedNote: Note;
  onClose: () => void;
  
}) => {
  return (
    <div className="flex items-center gap-2 ">
      <div className="flex-1 flex items-center">
        <div className="bg-background border-t border-l border-r rounded-t-md pl-6 pr-1 flex items-center text-xs h-8">
          {title ? title : selectedNote.filename}
          <div className="flex-1 flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    'h-3 w-3 rounded-full transition-all duration-200 ml-2',
                    hasChanges ? 'bg-green-600/80' : 'bg-muted'
                  )}/>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{hasChanges ? '저장되지 않은 변경사항이 있습니다.' : '모든 변경사항이 저장되었습니다.'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="ml-auto">
            <Button 
            variant="ghost" size="icon" 
            className="bg-transparent hover:bg-transparent"
            onClick={onClose}>
              <X className="size-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>            
    </div>
  )
}