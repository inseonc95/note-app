import { useRef } from "react";

import { NoteList } from "@/components/NoteList";
import { NoteEditor } from "@/components/Editor";
import { AIChat, AIChatRef } from "@/components/AIChat";

const IndexPage = () => {
  const aiChatRef = useRef<AIChatRef>(null);
  return (
    <div className="flex h-[calc(100vh-28px)] bg-accent">
      <div className="w-1/4  flex flex-col">        
        <NoteList />
      </div>
      <div className="w-1/2 flex flex-col bg-background rounded-t-xl">
        <NoteEditor />
      </div>
      <div className="w-1/4  flex flex-col">
        <AIChat ref={aiChatRef} />
      </div>
    </div>
  );
};

export default IndexPage;
