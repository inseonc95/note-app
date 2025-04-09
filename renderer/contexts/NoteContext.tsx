import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Note } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

interface NoteContextType {
  notes: Note[]
  selectedNote: Note | null
  addNote: () => void
  updateNote: (id: string, note: Partial<Note>) => void
  deleteNote: (id: string) => void
  selectNote: (id: string) => void
  unSelectNote: () => void
  hasChanges: boolean
  setHasChanges: (hasChanges: boolean) => void
  refreshNotes: () => void
}

const NoteContext = createContext<NoteContextType | null>(null)

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const refreshNotes = useCallback(async () => {
    const loadedNotes = await window.note.loadNotes()
    setNotes(loadedNotes)
    if (selectedNote && !loadedNotes.find(note => note.id === selectedNote.id)) {
      setSelectedNote(null)
    }

    setHasChanges(false)
  }, [selectedNote])

  useEffect(() => {
    refreshNotes()
  }, [refreshNotes])

  useEffect(() => {
    window.electron.updateHasChanges(hasChanges)
  }, [hasChanges])

  const addNote = async () => {
    setHasChanges(false)
    const nodeId = uuidv4()
    const newNote: Note = {
      id: nodeId,
      filename: `${nodeId}`,
      title: 'Untitled',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      await window.note.saveNote(newNote)
      setNotes([...notes, newNote])
      setSelectedNote(newNote)
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }


  const deleteNote = async (id: string) => {
    try {
      await window.note.deleteNote(id)
      const updatedNotes = notes.filter(note => note.id !== id)
      setNotes(updatedNotes)
      if (selectedNote?.id === id) {
        setSelectedNote(updatedNotes[0] || null)
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const selectNote = (id: string) => {
    const note = notes.find(note => note.id === id)
    if (note) {
      setHasChanges(false)
      setSelectedNote(note)
    }
  }

  const unSelectNote = () => {
    setSelectedNote(null)
    setHasChanges(false)
  }

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    const currentNote = notes.find(note => note.id === id)
    if (!currentNote) return

    const updatedNote = {
      ...currentNote,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    try {
      await window.note.saveNote(updatedNote)
      setNotes(prev => prev.map(note => note.id === id ? updatedNote : note))
      if (selectedNote?.id === id) {
        setSelectedNote(prev => prev?.id === id ? updatedNote : prev)
      }
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }, [notes, selectedNote])

  return (
    <NoteContext.Provider
      value={{
        notes,
        selectedNote,
        addNote,
        deleteNote,
        selectNote,
        updateNote,
        unSelectNote,
        hasChanges,
        setHasChanges,
        refreshNotes,
      }}
    >
      {children}
    </NoteContext.Provider>
  )
}

export const useNotes = () => {
  const context = useContext(NoteContext)
  if (!context) {
    throw new Error('useNotes must be used within a NoteProvider')
  }
  return context
} 