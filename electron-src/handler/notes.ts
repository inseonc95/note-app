import { NoteService } from '../service/note'
import { ipcMain, dialog } from 'electron'

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

  ipcMain.handle('get-notes-dir', async () => {
    return noteService.getNotesDir()
  })

  ipcMain.handle('set-notes-dir', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (!result.canceled && result.filePaths.length > 0) {
      await noteService.setNotesDir(result.filePaths[0])
      return result.filePaths[0]
    }
    return null
  })

  ipcMain.handle('reset-notes-dir', async () => {
    return await noteService.resetNotesDir()
  })
}
