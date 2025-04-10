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
  hasChanges: boolean
  setHasChanges: (hasChanges: boolean) => void
  loadAndSyncNotes: () => void
  notesDir: string
  changeNotesDir: () => Promise<void>
  resetNotesDir: () => Promise<void>
  openedNotes: Note[]
  closeNote: (id: string) => void
}

const NoteContext = createContext<NoteContextType | null>(null)

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [notesDir, setNotesDir] = useState("")

  const [openedNotes, setOpenedNotes] = useState<Note[]>([])

  const loadAndSyncNotes = useCallback(async () => {
    const loadedNotes = await window.note.loadNotes()
    setNotes(loadedNotes)
    if (selectedNote && !loadedNotes.find(note => note.id === selectedNote.id)) {
      setSelectedNote(null)
    }

    setHasChanges(false)
  }, [selectedNote])

  useEffect(() => {
    loadAndSyncNotes()
  }, [loadAndSyncNotes])

  useEffect(() => {
    window.electron.updateHasChanges(hasChanges)
  }, [hasChanges])

  useEffect(() => {
    const loadNotesDir = async () => {
      const dir = await window.note.getNotesDir()
      setNotesDir(dir)
    }
    loadNotesDir()
  }, [])

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
      setOpenedNotes([...openedNotes, newNote])
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
        setOpenedNotes(openedNotes.filter(note => note.id !== id))
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
      if (!openedNotes.some(n => n.id === id)) {
        setOpenedNotes([...openedNotes, note])
      }
      setSelectedNote(note)
    }
  }

  const initOpenedNote = () => {
    setSelectedNote(null)
    setOpenedNotes([])
    setHasChanges(false)
  }
  

  const closeNote = (id: string) => {
    setOpenedNotes(prev => {
      const remainingNotes = prev.filter(note => note.id !== id)
      if (selectedNote?.id === id) {
        setSelectedNote(remainingNotes[remainingNotes.length - 1] || null)
      }
      return remainingNotes
    })

    if (id === selectedNote?.id) {
      setHasChanges(false)
    }
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
      setOpenedNotes(prev => prev.map(note => note.id === id ? updatedNote : note))
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }, [notes, selectedNote])

  const changeNotesDir = useCallback(async () => {
    if (hasChanges) {
      const response = confirm('저장되지 않은 변경사항이 있습니다. 저장하지 않고 진행하시겠습니까?')
      if (!response) return
    }
    const newDir = await window.note.setNotesDir()
    if (newDir) {
      setNotesDir(newDir)
      initOpenedNote()
      loadAndSyncNotes()
    }
  }, [hasChanges, initOpenedNote, loadAndSyncNotes])

  const resetNotesDir = useCallback(async () => {
    if (hasChanges) {
      const response = confirm('저장되지 않은 변경사항이 있습니다. 저장하지 않고 진행하시겠습니까?')
      if (!response) return
    }
    const defaultDir = await window.note.resetNotesDir()
    if (defaultDir) {
      setNotesDir(defaultDir)
      initOpenedNote()
      loadAndSyncNotes()
    }
  }, [hasChanges, initOpenedNote, loadAndSyncNotes])

  return (
    <NoteContext.Provider
      value={{
        notes,
        selectedNote,
        addNote,
        deleteNote,
        selectNote,
        updateNote,
        hasChanges,
        setHasChanges,
        loadAndSyncNotes,
        notesDir,
        changeNotesDir,
        resetNotesDir,
        openedNotes,
        closeNote,
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