import { app } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'
// import { Note } from '../../renderer/interfaces/note'

export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export class NoteService {
  private notesDir: string

  constructor() {
    this.notesDir = path.join(app.getPath('userData'), 'notes')
    console.log('Notes directory:', this.notesDir)
    this.ensureNotesDirectory()
  }

  private async ensureNotesDirectory() {
    try {
      await fs.mkdir(this.notesDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create notes directory:', error)
    }
  }

  private getNotePath(id: string): string {
    return path.join(this.notesDir, `${id}.md`)
  }

  private parseFrontMatter(content: string): { [key: string]: string } {
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
    if (!frontMatterMatch) return {}

    const frontMatter = frontMatterMatch[1]
    const metadata: { [key: string]: string } = {}

    frontMatter.split('\n').forEach(line => {
      const [key, ...values] = line.split(':')
      if (key && values.length > 0) {
        metadata[key.trim()] = values.join(':').trim()
      }
    })

    return metadata
  }

  private generateFrontMatter(note: Note): string {
    return `---
title: ${note.title}
createdAt: ${note.createdAt}
updatedAt: ${note.updatedAt}
---

`
  }

  async loadNotes(): Promise<Note[]> {
    try {
      const files = await fs.readdir(this.notesDir)
      const notes: Note[] = []

      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = await fs.readFile(path.join(this.notesDir, file), 'utf-8')
          const metadata = this.parseFrontMatter(content)
          const noteContent = content.split('---')[2]?.trim() || ''

          notes.push({
            id: path.basename(file, '.md'),
            title: metadata.title || 'Untitled',
            content: noteContent,
            createdAt: metadata.createdAt || new Date().toISOString(),
            updatedAt: metadata.updatedAt || new Date().toISOString(),
          })
        }
      }

      return notes
    } catch (error) {
      console.error('Failed to load notes:', error)
      return []
    }
  }

  async saveNote(note: Note): Promise<void> {
    try {
      const filePath = this.getNotePath(note.id)
      const content = this.generateFrontMatter(note) + note.content

      // const content = note.title + "\n" + note.content
      await fs.writeFile(filePath, content, 'utf-8')
    } catch (error) {
      console.error('Failed to save note:', error)
      throw error
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      const filePath = this.getNotePath(id)
      await fs.unlink(filePath)
    } catch (error) {
      console.error('Failed to delete note:', error)
      throw error
    }
  }
} 