import { NoteService } from '../service/note'
import { ipcMain } from 'electron'

export const setupNotesHandlers = () => {
  const noteService = new NoteService()

  // Note 관련 IPC 핸들러 설정
  ipcMain.handle('load-notes', async () => {
    return await noteService.loadNotes()
  })

  ipcMain.handle('save-note', async (_, note) => {
    await noteService.saveNote(note)
  })

  ipcMain.handle('delete-note', async (_, id) => {
    await noteService.deleteNote(id)
  })
}
