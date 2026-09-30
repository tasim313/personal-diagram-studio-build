import type { DiagramItem } from '@/lib/diagram/types'
import { generateUUID, saveDiagram } from './diagrams'

export interface DiagramSnapshot {
  id: string
  diagramId: string
  versionNumber: number
  description: string
  createdAt: string
  author: string
  data: unknown
}

const STORAGE_PREFIX = 'studio_diagram_versions_'

export function getDiagramSnapshots(diagramId: string): DiagramSnapshot[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${diagramId}`)
    if (!raw) return []
    return JSON.parse(raw) as DiagramSnapshot[]
  } catch (err) {
    console.error('Failed to load diagram snapshots:', err)
    return []
  }
}

export function createDiagramSnapshot(
  diagram: DiagramItem,
  description: string = 'Manual Snapshot',
  author: string = 'You'
): DiagramSnapshot {
  const existing = getDiagramSnapshots(diagram.diagramId)
  const nextVersionNum = existing.length > 0 ? Math.max(...existing.map((s) => s.versionNumber)) + 1 : 1

  const newSnapshot: DiagramSnapshot = {
    id: generateUUID(),
    diagramId: diagram.diagramId,
    versionNumber: nextVersionNum,
    description: description.trim() || `Version ${nextVersionNum}`,
    createdAt: new Date().toISOString(),
    author,
    data: JSON.parse(JSON.stringify(diagram.data)),
  }

  const updated = [newSnapshot, ...existing]
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${diagram.diagramId}`, JSON.stringify(updated))
  } catch (err) {
    console.error('Failed to save diagram snapshot:', err)
  }

  return newSnapshot
}

export async function restoreDiagramSnapshot(
  diagram: DiagramItem,
  snapshot: DiagramSnapshot
): Promise<DiagramItem> {
  const restored: DiagramItem = {
    ...diagram,
    data: JSON.parse(JSON.stringify(snapshot.data)),
    version: snapshot.versionNumber,
    updatedAt: new Date().toISOString(),
  }

  await saveDiagram(restored)
  return restored
}
