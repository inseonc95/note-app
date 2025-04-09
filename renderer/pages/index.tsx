import { useRef, useEffect } from "react";
import { NoteList } from "@/components/NoteList";
import { NoteEditor } from "@/components/Editor";
import { AIChat } from "@/components/AIChat";
import { useChatUI } from "@/contexts/ChatUIContext";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import { editor } from "monaco-editor"
const IndexPage = () => {
  const { isShowAIChat, toggleAIChat } = useChatUI();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const setMonacoEditorRef = (editor: editor.IStandaloneCodeEditor | null) => {
    editorRef.current = editor
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        toggleAIChat();
        if (editorRef.current) {
          editorRef.current.focus()
        }
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
        <NoteEditor 
        editorRef={editorRef}
        setMonacoEditorRef={setMonacoEditorRef}
        />
      </ResizablePanel>
      {isShowAIChat && (
        <>
          <ResizableHandle 
          className="bg-transparent"
          />
          <ResizablePanel 
          defaultSize={20}
          className="flex flex-col">
            <AIChat />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};

export default IndexPage;
