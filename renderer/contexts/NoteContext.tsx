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
}

const NoteContext = createContext<NoteContextType | null>(null)

export const NoteProvider = ({ children }: { children: React.ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [hasChanges, setHasChanges] = useState(false)


  useEffect(() => {
    window.electron.updateHasChanges(hasChanges)
  }, [hasChanges])

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      const loadedNotes = await window.note.loadNotes()
      setNotes(loadedNotes)
      if (loadedNotes.length > 0 && !selectedNote) {
        setSelectedNote(loadedNotes[0])
      }
    } catch (error) {
      console.error('Failed to load notes:', error)
    }
  }

  const addNote = async () => {
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
      setSelectedNote(note)
      setHasChanges(false)
    }
  }

  const unSelectNote = () => {
    setSelectedNote(null)
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