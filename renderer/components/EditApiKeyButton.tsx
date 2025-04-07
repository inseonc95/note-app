import { forwardRef, useState } from "react"
import { Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"

export const EditApiKeyButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost"><Settings className="size-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>OpenAI API 키 수정</DialogTitle>
            <DialogDescription>
              OpenAI API 키를 수정해주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              취소
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
