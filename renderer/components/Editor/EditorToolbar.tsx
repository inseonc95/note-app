import { Button } from "@/components/ui/button"
import { Command } from "lucide-react"

export const EditorToolbar = ({
  position,
  handleAddToChat,
  handleShowInlineChat,
}: {
  position: { top: number; left: number };
  handleAddToChat: () => void;
  handleShowInlineChat: () => void;
}) => {
  return (
    <div
    className="fixed z-50 bg-primary text-primary-foreground px-2 py-1 rounded-md shadow-lg"
    style={{
      top: `${position.top}px`,
      left: `${position.left}px`,
    }}
    >
      <Button
        size="sm"
        className="h-6 text-xs"
        onClick={handleAddToChat}
      >
        <span>chat</span>
      </Button>
      <span className="text-muted-foreground">|</span> 
      <Button
        size="sm"
        className="h-6 text-xs"
        onClick={handleShowInlineChat}
      >
        <span>Edit</span>
        <div className="flex items-center text-gray-400">
          <Command className="size-3 ml-2" />
          <span className="font-mono">K</span>
        </div>
      </Button>
    </div>
  )
}
