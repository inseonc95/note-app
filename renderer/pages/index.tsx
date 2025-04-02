import { useEffect, useCallback, useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NoteList } from "@/components/NoteList";
import { Editor } from "@/components/Editor";
import { useNotes } from "@/contexts/NoteContext";

const IndexPage = () => {
  const { addNote } = useNotes();

  const handleAddNote = () => {
    addNote("New Note");
  };

  return (
      <div className="flex h-full">
        {/* 왼쪽: 노트 목록 (20-25%) */}
        <div className="w-1/4 border-r bg-background">
          <div className="flex h-14 items-center border-b px-4">
            <h2 className="text-lg font-semibold">Notes</h2>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={handleAddNote}>
              <Plus className="size-4" />
            </Button>
          </div>
          <NoteList />
        </div>
        {/* 중앙: 에디터 (50-60%) */}
        <div className="w-1/2">
          <div className="flex h-14 items-center border-b px-4">
            <h2 className="text-lg font-semibold">Editor</h2>
          </div>
          <Editor />
        </div>

        {/* 오른쪽: AI 채팅 (20-25%) */}
        <div className="w-1/4 border-l bg-background">
          <div className="flex h-14 items-center border-b px-4">
            <h2 className="text-lg font-semibold">AI Assistant</h2>
          </div>
          <div className="p-4">
            {/* AIChat 컴포넌트가 들어갈 자리 */}
          </div>
        </div>
      </div>
  );
};

export default IndexPage;
