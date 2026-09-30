import type { BinaryFiles } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'

export type DiagramProject = {
  id: string
  name: string
  type: string
  createdAt: string
  updatedAt: string
  elements: readonly ExcalidrawElement[]
  files: BinaryFiles
}

const databaseName = 'personal-diagram-studio'
const storeName = 'projects'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(storeName, { keyPath: 'id' })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getProject(id: string): Promise<DiagramProject | undefined> {
  if (typeof indexedDB === 'undefined') return undefined
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, 'readonly').objectStore(storeName).get(id)
    request.onsuccess = () => resolve(request.result as DiagramProject | undefined)
    request.onerror = () => reject(request.error)
  })
}

export async function saveProject(project: DiagramProject): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, 'readwrite').objectStore(storeName).put(project)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function createProject(type = 'Blank diagram'): DiagramProject {
  const now = new Date().toISOString()
  return { id: generateUUID(), name: 'Untitled diagram', type, createdAt: now, updatedAt: now, elements: [], files: {} }
}
