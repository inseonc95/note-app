import { useEffect, useCallback, useState, useRef } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NoteList } from "@/components/NoteList";
import { Editor } from "@/components/Editor";
import { useNotes } from "@/contexts/NoteContext";
import { AIChat, AIChatRef } from "@/components/AIChat";

const IndexPage = () => {
  const { addNote } = useNotes();
  const aiChatRef = useRef<AIChatRef>(null);

  const handleAddNote = () => {
    addNote("New Note");
  };

  return (
    <div className="flex h-[calc(100vh-28px)]">
      {/* 왼쪽: 노트 목록 (20-25%) */}
      <div className="w-1/4 border-r bg-accent flex flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <h2 className="text-lg font-semibold">Notes</h2>
          <Button variant="ghost" size="icon" className="ml-auto" onClick={handleAddNote}>
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <NoteList />
        </div>
      </div>
      {/* 중앙: 에디터 (50-60%) */}
      <div className="w-1/2 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <Editor aiChatRef={aiChatRef} />
        </div>
      </div>

      {/* 오른쪽: AI 채팅 (20-25%) */}
      <div className="w-1/4 border-l bg-accent flex flex-col">

          <AIChat ref={aiChatRef} />

      </div>
    </div>
  );
};

export default IndexPage;
