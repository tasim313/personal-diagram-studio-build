import type { DiagramCategory, DiagramEngineType, DiagramItem, DiagramMetadata, ProjectType, StudioProject } from '@/lib/diagram/types'
import { DIAGRAM_CATALOG, PROJECT_TEMPLATES } from '@/lib/diagram/types'

const DB_NAME = 'personal-diagram-studio-v2'
const DB_VERSION = 1
const STORE_PROJECTS = 'projects'
const STORE_DIAGRAMS = 'diagrams'

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available in this environment'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_DIAGRAMS)) {
        const diagramStore = db.createObjectStore(STORE_DIAGRAMS, { keyPath: 'diagramId' })
        diagramStore.createIndex('projectId', 'projectId', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// ── Projects ─────────────────────────────────────────────────────────

export async function getAllProjects(): Promise<StudioProject[]> {
  if (typeof indexedDB === 'undefined') return []
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_PROJECTS, 'readonly')
    const store = transaction.objectStore(STORE_PROJECTS)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result as StudioProject[] || [])
    request.onerror = () => reject(request.error)
  })
}

export async function getStudioProject(id: string): Promise<StudioProject | undefined> {
  if (typeof indexedDB === 'undefined') return undefined
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_PROJECTS, 'readonly')
    const store = transaction.objectStore(STORE_PROJECTS)
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result as StudioProject | undefined)
    request.onerror = () => reject(request.error)
  })
}

export async function saveStudioProject(project: StudioProject): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_PROJECTS, 'readwrite')
    const store = transaction.objectStore(STORE_PROJECTS)
    const request = store.put(project)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function deleteStudioProject(id: string): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PROJECTS, STORE_DIAGRAMS], 'readwrite')
    const projectStore = transaction.objectStore(STORE_PROJECTS)
    const diagramStore = transaction.objectStore(STORE_DIAGRAMS)

    projectStore.delete(id)

    // Delete all associated diagrams
    const index = diagramStore.index('projectId')
    const request = index.getAllKeys(id)
    request.onsuccess = () => {
      const keys = request.result
      keys.forEach((key) => diagramStore.delete(key))
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

// ── Diagrams ─────────────────────────────────────────────────────────

export async function getDiagramsByProject(projectId: string): Promise<DiagramItem[]> {
  if (typeof indexedDB === 'undefined') return []
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_DIAGRAMS, 'readonly')
    const store = transaction.objectStore(STORE_DIAGRAMS)
    const index = store.index('projectId')
    const request = index.getAll(projectId)
    request.onsuccess = () => resolve(request.result as DiagramItem[] || [])
    request.onerror = () => reject(request.error)
  })
}

export async function getDiagram(diagramId: string): Promise<DiagramItem | undefined> {
  if (typeof indexedDB === 'undefined') return undefined
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_DIAGRAMS, 'readonly')
    const store = transaction.objectStore(STORE_DIAGRAMS)
    const request = store.get(diagramId)
    request.onsuccess = () => resolve(request.result as DiagramItem | undefined)
    request.onerror = () => reject(request.error)
  })
}

export async function saveDiagram(diagram: DiagramItem): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_DIAGRAMS, STORE_PROJECTS], 'readwrite')
    const diagramStore = transaction.objectStore(STORE_DIAGRAMS)
    const projectStore = transaction.objectStore(STORE_PROJECTS)

    diagramStore.put(diagram)

    // Ensure projectId includes diagramId
    const projectReq = projectStore.get(diagram.projectId)
    projectReq.onsuccess = () => {
      const project = projectReq.result as StudioProject | undefined
      if (project) {
        if (!project.diagramIds.includes(diagram.diagramId)) {
          project.diagramIds.push(diagram.diagramId)
          project.updatedAt = new Date().toISOString()
          projectStore.put(project)
        }
      }
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function deleteDiagram(diagramId: string): Promise<void> {
  if (typeof indexedDB === 'undefined') return
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_DIAGRAMS, STORE_PROJECTS], 'readwrite')
    const diagramStore = transaction.objectStore(STORE_DIAGRAMS)
    const projectStore = transaction.objectStore(STORE_PROJECTS)

    const diagReq = diagramStore.get(diagramId)
    diagReq.onsuccess = () => {
      const diag = diagReq.result as DiagramItem | undefined
      if (diag) {
        diagramStore.delete(diagramId)
        const projReq = projectStore.get(diag.projectId)
        projReq.onsuccess = () => {
          const proj = projReq.result as StudioProject | undefined
          if (proj) {
            proj.diagramIds = proj.diagramIds.filter((id) => id !== diagramId)
            proj.updatedAt = new Date().toISOString()
            projectStore.put(proj)
          }
        }
      }
    }

    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

// ── Factory & Operation Helpers ─────────────────────────────────────────

export function createNewProject(params?: {
  name?: string
  description?: string
  projectType?: ProjectType
  ownerId?: string
}): StudioProject {
  const now = new Date().toISOString()
  const pType = params?.projectType || 'software-engineering'
  return {
    id: generateUUID(),
    name: params?.name || 'New Architecture Project',
    description: params?.description || 'Enterprise visual software engineering design',
    projectType: pType,
    ownerId: params?.ownerId || 'user',
    createdAt: now,
    updatedAt: now,
    diagramIds: [],
    createdBy: params?.ownerId || 'user',
  }
}

export function createNewDiagram(params: {
  projectId: string
  name: string
  type: string
  category?: DiagramCategory
  engine?: DiagramEngineType
  createdBy?: string
  metadata?: DiagramMetadata
}): DiagramItem {
  const now = new Date().toISOString()
  const def = DIAGRAM_CATALOG.find((d) => d.id === params.type)
  const category = params.category || def?.category || 'general'
  const engine = params.engine || def?.recommendedEngine || 'excalidraw'
  const diagramId = generateUUID()

  // Default initial data structure based on engine
  let initialData: unknown = { elements: [], files: {} }
  if (engine === 'reactflow') {
    initialData = { nodes: [], edges: [] }
  } else if (engine === 'gojs') {
    initialData = { nodeDataArray: [], linkDataArray: [] }
  }

  return {
    diagramId,
    id: diagramId,
    projectId: params.projectId,
    name: params.name || def?.name || 'Untitled Diagram',
    type: params.type,
    category,
    engine,
    data: initialData,
    createdAt: now,
    updatedAt: now,
    version: 1,
    createdBy: params.createdBy || 'user',
    metadata: params.metadata,
  }
}

export async function duplicateDiagram(source: DiagramItem): Promise<DiagramItem> {
  const dup = createNewDiagram({
    projectId: source.projectId,
    name: `${source.name} (Copy)`,
    type: source.type,
    category: source.category,
    engine: source.engine,
    createdBy: source.createdBy,
    metadata: source.metadata ? { ...source.metadata } : undefined,
  })

  // Deep clone data
  dup.data = JSON.parse(JSON.stringify(source.data || {}))
  await saveDiagram(dup)
  return dup
}

export async function renameDiagram(diagramId: string, newName: string): Promise<DiagramItem | undefined> {
  const diag = await getDiagram(diagramId)
  if (!diag) return undefined
  diag.name = newName.trim()
  diag.updatedAt = new Date().toISOString()
  diag.version = (diag.version || 1) + 1
  await saveDiagram(diag)
  return diag
}

export async function moveDiagram(diagramId: string, targetProjectId: string): Promise<DiagramItem | undefined> {
  const diag = await getDiagram(diagramId)
  if (!diag) return undefined

  const oldProjectId = diag.projectId
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_DIAGRAMS, STORE_PROJECTS], 'readwrite')
    const diagramStore = transaction.objectStore(STORE_DIAGRAMS)
    const projectStore = transaction.objectStore(STORE_PROJECTS)

    // 1. Update diagram's projectId
    diag.projectId = targetProjectId
    diag.updatedAt = new Date().toISOString()
    diagramStore.put(diag)

    // 2. Remove diagram from old project
    const oldReq = projectStore.get(oldProjectId)
    oldReq.onsuccess = () => {
      const oldProj = oldReq.result as StudioProject | undefined
      if (oldProj) {
        oldProj.diagramIds = oldProj.diagramIds.filter((id) => id !== diagramId)
        oldProj.updatedAt = new Date().toISOString()
        projectStore.put(oldProj)
      }
    }

    // 3. Add diagram to target project
    const targetReq = projectStore.get(targetProjectId)
    targetReq.onsuccess = () => {
      const targetProj = targetReq.result as StudioProject | undefined
      if (targetProj) {
        if (!targetProj.diagramIds.includes(diagramId)) {
          targetProj.diagramIds.push(diagramId)
          targetProj.updatedAt = new Date().toISOString()
          projectStore.put(targetProj)
        }
      }
    }

    transaction.oncomplete = () => resolve(diag)
    transaction.onerror = () => reject(transaction.error)
  })
}

/**
 * Create a new project with templates based on ProjectType (Section 6, 7, 23)
 */
export async function createProjectWithTemplate(params: {
  name: string
  description?: string
  projectType: ProjectType
  ownerId: string
}): Promise<{ project: StudioProject; diagrams: DiagramItem[] }> {
  const project = createNewProject({
    name: params.name,
    description: params.description,
    projectType: params.projectType,
    ownerId: params.ownerId,
  })

  await saveStudioProject(project)

  // If Blank Project, return empty project with 0 diagrams (Section 7)
  if (params.projectType === 'blank') {
    return { project, diagrams: [] }
  }

  // Find template definition
  const template = PROJECT_TEMPLATES.find((t) => t.id === params.projectType)
  const defaultTypes = template?.defaultDiagramTypes || []

  const createdDiagrams: DiagramItem[] = []

  for (let i = 0; i < defaultTypes.length; i++) {
    const typeId = defaultTypes[i]
    const def = DIAGRAM_CATALOG.find((d) => d.id === typeId)
    if (!def) continue

    const diag = createNewDiagram({
      projectId: project.id,
      name: `${String(i + 1).padStart(2, '0')} ${def.name}`,
      type: def.id,
      category: def.category,
      engine: def.recommendedEngine,
      createdBy: params.ownerId,
      metadata: { workflowOrder: i + 1 },
    })

    await saveDiagram(diag)
    createdDiagrams.push(diag)
  }

  project.diagramIds = createdDiagrams.map((d) => d.diagramId)
  await saveStudioProject(project)

  return { project, diagrams: createdDiagrams }
}

/**
 * Seed initial sample diagrams for a fresh project (E-Commerce Architecture Suite)
 */
export async function seedProjectWithSampleDiagrams(project: StudioProject, userEmail: string): Promise<DiagramItem[]> {
  const result = await createProjectWithTemplate({
    name: project.name,
    description: project.description,
    projectType: project.projectType || 'software-engineering',
    ownerId: userEmail,
  })

  // sync IDs back to original reference
  project.diagramIds = result.project.diagramIds
  return result.diagrams
}
