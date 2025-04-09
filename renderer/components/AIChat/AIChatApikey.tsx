import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AddApiKeyButton } from "./AddApiKeyButton"
import { useChatUI } from "@/contexts/ChatUIContext"

export const AIChatApikey = () => {

  const { 
    saveApiKey,
  } = useChatUI()

  const handleSave = async (apiKey: string) => {
    try {
      const response = await saveApiKey(apiKey);
      if (response) {
        alert("API 키 등록에 성공했습니다.");
      }
    } catch (error) {
      alert("API 키 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
  <div className="flex justify-center items-center h-full">
    <TooltipProvider>
      <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <AddApiKeyButton handleSave={handleSave} />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>API 키를 설정하여 AI Assistant를 사용할 수 있습니다.</p>
      </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
  )
}