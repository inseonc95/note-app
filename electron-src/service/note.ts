import { app, shell } from 'electron'
import { promises as fs } from 'fs'
import path from 'path'

import { Note } from '../lib/types'

export class NoteService {
  private notesDir: string = ''
  private configPath: string

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'config.json')
    this.loadConfig().then(config => {
      this.notesDir = config?.notesDir || path.join(app.getPath('userData'), 'notes')
      console.log('Notes directory:', this.notesDir)
      this.ensureNotesDirectory()
    })
  }

  private async loadConfig() {
    try {
      const config = await fs.readFile(this.configPath, 'utf-8')
      return JSON.parse(config)
    } catch (error) {
      return null
    }
  }

  private async saveConfig(config: any) {
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8')
  }

  async setNotesDir(newDir: string) {
    this.notesDir = newDir
    await this.saveConfig({ notesDir: newDir })
    await this.ensureNotesDirectory()
  }

  async resetNotesDir() {
    const defaultDir = path.join(app.getPath('userData'), 'notes')
    this.notesDir = defaultDir
    await this.saveConfig({ notesDir: defaultDir })
    await this.ensureNotesDirectory()
    return defaultDir
  }

  getNotesDir() {
    return this.notesDir
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

  private parseFrontMatter(content: string, filename: string): { [key: string]: string } {
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
    if (!frontMatterMatch) {
      return {
        title: '',
        filename: path.basename(filename, '.md'),
        content: content
      }
    }

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
          const metadata = this.parseFrontMatter(content, file)
          const noteContent = metadata.content || content.split('---').slice(2).join('---').trim()

          notes.push({
            id: path.basename(file, '.md'),
            title: metadata.title || '',
            filename: metadata.filename || path.basename(file, '.md'),
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

  async deleteNote(id: string) {
    const filePath = path.join(this.notesDir, `${id}.md`)
    try {
      await shell.trashItem(filePath)
    } catch (error) {
      console.error('Failed to move note to trash:', error)
      throw error
    }
  }
} 