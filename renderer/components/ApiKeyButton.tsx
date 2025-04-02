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

export const ApiKeyButton = ({ handleSave }: { handleSave: (apiKey: string) => void }) => {
  const [apiKey, setApiKey] = useState("");
  const [isOpen, setIsOpen] = useState(false);



  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost"><Settings className="size-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>OpenAI API 키 등록</DialogTitle>
            <DialogDescription>
              OpenAI API 키를 입력해주세요. 이 키는 로컬에 안전하게 저장됩니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
            <p className="text-xs text-gray-500">
              <span className="font-bold text-red-500 pr-1">주의</span>
              이미 등록된 키가 있으면 등록된 키가 삭제되고 새로운 키가 등록됩니다.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              취소
            </Button>
            <Button onClick={async () => {
              try {
                await handleSave(apiKey)
                setIsOpen(false)
              } catch (error) {
                console.error("API 키 등록에 실패했습니다. 다시 시도해주세요.", error)
              } finally {
                setIsOpen(false)
              }
            }}>등록</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
