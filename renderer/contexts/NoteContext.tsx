import { createContext, useContext, useState, ReactNode } from "react"

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

interface NoteContextType {
  notes: Note[]
  selectedNote: Note | null
  addNote: (title: string) => void
  deleteNote: (id: string) => void
  selectNote: (id: string) => void
  updateNote: (id: string, note: Note) => void
}

const NoteContext = createContext<NoteContextType | undefined>(undefined)

export function NoteProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Welcome Note",
      content: "Welcome to your new note-taking app!",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  const addNote = (title: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setNotes((prev) => [...prev, newNote])
    setSelectedNote(newNote)
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
    if (selectedNote?.id === id) {
      setSelectedNote(null)
    }
  }

  const selectNote = (id: string) => {
    const note = notes.find((note) => note.id === id)
    setSelectedNote(note || null)
  }

  const updateNote = (id: string, updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? updatedNote : note))
    )
    if (selectedNote?.id === id) {
      setSelectedNote(updatedNote)
    }
  }

  return (
    <NoteContext.Provider
      value={{
        notes,
        selectedNote,
        addNote,
        deleteNote,
        selectNote,
        updateNote,
      }}
    >
      {children}
    </NoteContext.Provider>
  )
}

export function useNotes() {
  const context = useContext(NoteContext)
  if (context === undefined) {
    throw new Error("useNotes must be used within a NoteProvider")
  }
  return context
} 