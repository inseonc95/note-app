import { useRef, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";
import { NoteList } from "@/components/NoteList";
import { NoteEditor } from "@/components/Editor";
import { AIChat, AIChatRef } from "@/components/AIChat";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"


const IndexPage = () => {
  const aiChatRef = useRef<AIChatRef>(null);
  const { isShowAIChat, toggleAIChat } = useChat();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        toggleAIChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleAIChat]);

  return (
    <ResizablePanelGroup direction="horizontal"
    className="flex h-[calc(100vh-28px)] bg-accent"
    >
      <ResizablePanel 
      defaultSize={20}
      className="flex flex-col">        
        <NoteList />
      </ResizablePanel>
      <ResizableHandle 
      className="bg-transparent"
      />
      <ResizablePanel 
      defaultSize={50}
      className="flex flex-col bg-background rounded-t-xl">
        <NoteEditor />
      </ResizablePanel>
      {isShowAIChat && (
        <>
          <ResizableHandle 
          className="bg-transparent"
          />
          <ResizablePanel 
          defaultSize={20}
          className="flex flex-col">
            <AIChat ref={aiChatRef} />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};

export default IndexPage;
