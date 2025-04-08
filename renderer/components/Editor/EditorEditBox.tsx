import { Button } from "@/components/ui/button"
import { Check, Send, X } from "lucide-react"


export const EditorEditBox = ({
  position,
  showPreview,
  editBoxRef,
  editBoxContent,
  editTargetContent,
  onSubmit,
  onChange,
  onApply,
  onClose,
}: {
  position: { top: number; left: number };
  showPreview: boolean;
  editBoxRef: React.RefObject<HTMLTextAreaElement>;
  editBoxContent: string;
  editTargetContent: string;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (value: string) => void;
  onApply: () => void;
  onClose: () => void;
}) => {
  return (
    <div
    className="fixed z-50 p-2 bg-accent rounded-md shadow-lg"
    style={{
      top: `${position.top}px`,
      left: `${position.left}px`,
      width: '400px',
    }}
    >
      {!showPreview ? (
        <form onSubmit={onSubmit} className="flex items-center gap-2 bg-background rounded-md p-2">
          <textarea 
            ref={editBoxRef}
            className="w-full resize-none border-none text-xs font-bold focus:outline-none h-[17px]"
            placeholder="수정하세요"
            value={editBoxContent}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSubmit(e)
              }
            }}
          />
          <Button type="submit" size="icon" className="h-6 w-6">
            <Send className="size-3" />
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-2 bg-background rounded-md p-2">
          <div className="flex flex-col gap-1">
            <div className="text-xs text-muted-foreground">원본: {editTargetContent}</div>
            <div className="text-xs text-green-600">{editBoxContent}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Button 
                type="button" 
                size="icon" 
                className="h-6 w-6"
                variant="outline"
                onClick={onApply}
              >
                <Check className="size-3" />
              </Button>
              <Button 
                type="button" 
                size="icon" 
                className="h-6 w-6"
                variant="outline"
                onClick={onClose}
              >
                <X className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
  </div>
  )
}