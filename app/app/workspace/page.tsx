'use client'

import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Diamond,
  Plus,
  PanelLeft,
  Save,
  ChevronDown,
  LayoutGrid,
  FolderOpen,
  Check,
  ChevronRight,
} from 'lucide-react'
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import type { Node, Edge } from 'reactflow'
import type { DiagramEngineType, DiagramItem, DiagramTypeDefinition, ProjectType, StudioProject } from '@/lib/diagram/types'
import { DIAGRAM_CATALOG, ENGINE_CAPABILITIES } from '@/lib/diagram/types'
import {
  createNewDiagram,
  createNewProject,
  createProjectWithTemplate,
  deleteDiagram,
  duplicateDiagram,
  getAllProjects,
  getDiagramsByProject,
  getStudioProject,
  moveDiagram,
  renameDiagram,
  saveDiagram,
  saveStudioProject,
  seedProjectWithSampleDiagrams,
} from '@/lib/storage/diagrams'
import { DiagramTypeSelector } from '@/components/diagram/DiagramTypeSelector'
import { DiagramLibrary } from '@/components/diagram/DiagramLibrary'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'

// Dynamic imports for the diagram editors
const ExcalidrawEditor = dynamic(
  () => import('@/components/diagram/ExcalidrawEditor').then((m) => m.ExcalidrawEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <span className="size-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
      </div>
    ),
  }
)

const ReactFlowEditor = dynamic(
  () => import('@/components/diagram/ReactFlowEditor').then((m) => m.ReactFlowEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <span className="size-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
    ),
  }
)

const GoJSEditor = dynamic(
  () => import('@/components/diagram/GoJSEditor').then((m) => m.GoJSEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <span className="size-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    ),
  }
)

export default function WorkspacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [allProjects, setAllProjects] = useState<StudioProject[]>([])
  const [project, setProject] = useState<StudioProject | null>(null)
  const [diagrams, setDiagrams] = useState<DiagramItem[]>([])
  const [activeDiagram, setActiveDiagram] = useState<DiagramItem | null>(null)
  const [view, setView] = useState<'editor' | 'library'>('library')
  const [status, setStatus] = useState('Ready')
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Modals and dropdowns
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [isDiagramDropdownOpen, setIsDiagramDropdownOpen] = useState(false)
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false)
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)
  const [quickCategory, setQuickCategory] = useState<string>('popular')
  const [quickSearch, setQuickSearch] = useState<string>('')

  const sidebarDiagramOptions = useMemo(() => {
    if (quickSearch.trim()) {
      const q = quickSearch.trim().toLowerCase()
      return DIAGRAM_CATALOG.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
      )
    }

    switch (quickCategory) {
      case 'flow':
        return DIAGRAM_CATALOG.filter((d) => d.category === 'flow-process')
      case 'software':
        return DIAGRAM_CATALOG.filter((d) => d.category === 'software-engineering')
      case 'database':
        return DIAGRAM_CATALOG.filter((d) => d.category === 'database')
      case 'security':
        return DIAGRAM_CATALOG.filter((d) => d.category === 'security')
      case 'uiux':
        return DIAGRAM_CATALOG.filter((d) => d.category === 'ui-ux')
      case 'infra':
        return DIAGRAM_CATALOG.filter((d) => d.category === 'infrastructure')
      case 'pm':
        return DIAGRAM_CATALOG.filter((d) => d.category === 'project-management')
      case 'popular':
      default:
        return [
          DIAGRAM_CATALOG.find((d) => d.id === 'flowchart'),
          DIAGRAM_CATALOG.find((d) => d.id === 'erd'),
          DIAGRAM_CATALOG.find((d) => d.id === 'system-architecture'),
          DIAGRAM_CATALOG.find((d) => d.id === 'freeform'),
          DIAGRAM_CATALOG.find((d) => d.id === 'activity-diagram'),
          DIAGRAM_CATALOG.find((d) => d.id === 'sequence-diagram'),
          DIAGRAM_CATALOG.find((d) => d.id === 'wireframe'),
          DIAGRAM_CATALOG.find((d) => d.id === 'cloud-architecture'),
        ].filter(Boolean) as DiagramTypeDefinition[]
    }
  }, [quickCategory, quickSearch])

  // Initialize or load project & diagrams
  useEffect(() => {
    let isMounted = true

    async function initWorkspace() {
      try {
        const paramProjectId = searchParams.get('projectId')
        const paramDiagramId = searchParams.get('diagramId')

        const all = await getAllProjects()
        if (isMounted) setAllProjects(all)

        let currentProj: StudioProject | undefined

        if (paramProjectId) {
          currentProj = await getStudioProject(paramProjectId)
        }

        if (!currentProj && all.length > 0) {
          currentProj = all[0]
        }

        // If no project exists yet, seed initial project with sample diagrams
        if (!currentProj) {
          const fresh = createNewProject({
            name: 'Enterprise Software Architecture',
            projectType: 'software-engineering',
            ownerId: 'user',
          })
          await saveStudioProject(fresh)
          const seeded = await seedProjectWithSampleDiagrams(fresh, 'user')
          if (isMounted) {
            setAllProjects([fresh])
            setProject(fresh)
            setDiagrams(seeded)
            if (seeded.length > 0) {
              setActiveDiagram(seeded[0])
              setView('editor')
            }
          }
          return
        }

        // Load diagrams for this project
        const projectDiagrams = await getDiagramsByProject(currentProj.id)

        if (isMounted) {
          setProject(currentProj)
          setDiagrams(projectDiagrams)

          if (paramDiagramId) {
            const found = projectDiagrams.find((d) => d.diagramId === paramDiagramId)
            if (found) {
              setActiveDiagram(found)
              setView('editor')
              return
            }
          }

          if (projectDiagrams.length > 0) {
            setActiveDiagram(projectDiagrams[0])
            setView(searchParams.get('view') === 'library' ? 'library' : 'editor')
          } else {
            setActiveDiagram(null)
            setView('library')
          }
        }
      } catch (err) {
        console.error('[workspace] Failed to load workspace:', err)
      }
    }

    initWorkspace()

    return () => {
      isMounted = false
    }
  }, [searchParams])

  const activeDiagramRef = useRef<DiagramItem | null>(null)
  activeDiagramRef.current = activeDiagram

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Persist diagram changes with debounced autosave (Section 20)
  const handleSaveActiveDiagram = useCallback((nextData: unknown) => {
    const current = activeDiagramRef.current
    if (!current) return

    // Update in-place to avoid re-mounting and re-render loops
    current.data = nextData
    current.updatedAt = new Date().toISOString()

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setStatus('Saving...')
        await saveDiagram(current)
        setStatus('Saved')
        const now = new Date()
        setLastSavedTime(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        )
      } catch (err) {
        console.error('[workspace] Failed to autosave diagram:', err)
        setStatus('Ready')
      }
    }, 750)
  }, [])

  // Create new diagram from modal selector
  const handleConfirmCreateDiagram = async (
    typeDef: DiagramTypeDefinition,
    name: string,
    engine: DiagramEngineType
  ) => {
    if (!project) return

    const newDiag = createNewDiagram({
      projectId: project.id,
      name,
      type: typeDef.id,
      category: typeDef.category,
      engine,
      createdBy: project.createdBy,
    })

    await saveDiagram(newDiag)
    setDiagrams((prev) => [newDiag, ...prev])
    setActiveDiagram(newDiag)
    setView('editor')

    startTransition(() => {
      router.push(`/app/workspace?projectId=${project.id}&diagramId=${newDiag.diagramId}&view=editor`)
    })
  }

  // Quick diagram creation from empty project buttons (Section 22)
  const handleCreateQuickDiagram = async (typeId: string) => {
    if (!project) return
    const def = DIAGRAM_CATALOG.find((d) => d.id === typeId)
    if (!def) return

    const newDiag = createNewDiagram({
      projectId: project.id,
      name: `${def.name} 1`,
      type: def.id,
      category: def.category,
      engine: def.recommendedEngine,
      createdBy: project.createdBy,
    })

    await saveDiagram(newDiag)
    setDiagrams((prev) => [newDiag, ...prev])
    setActiveDiagram(newDiag)
    setView('editor')

    startTransition(() => {
      router.push(`/app/workspace?projectId=${project.id}&diagramId=${newDiag.diagramId}&view=editor`)
    })
  }

  // Duplicate diagram (Section 16)
  const handleDuplicateDiagram = async (source: DiagramItem) => {
    if (!project) return
    const dup = await duplicateDiagram(source)
    setDiagrams((prev) => [dup, ...prev])
  }

  // Rename diagram (Section 17)
  const handleRenameDiagram = async (diagramId: string, newName: string) => {
    const updated = await renameDiagram(diagramId, newName)
    if (!updated) return

    setDiagrams((prev) =>
      prev.map((d) => (d.diagramId === diagramId ? { ...d, name: newName } : d))
    )
    if (activeDiagram?.diagramId === diagramId) {
      setActiveDiagram((prev) => (prev ? { ...prev, name: newName } : null))
    }
  }

  // Move diagram to another project (Section 18)
  const handleMoveDiagram = async (diagramId: string, targetProjectId: string) => {
    await moveDiagram(diagramId, targetProjectId)
    setDiagrams((prev) => prev.filter((d) => d.diagramId !== diagramId))
    if (activeDiagram?.diagramId === diagramId) {
      const remaining = diagrams.filter((d) => d.diagramId !== diagramId)
      if (remaining.length > 0) {
        setActiveDiagram(remaining[0])
      } else {
        setActiveDiagram(null)
        setView('library')
      }
    }
  }

  // Delete diagram (Section 17)
  const handleDeleteDiagram = async (diagramId: string) => {
    await deleteDiagram(diagramId)
    setDiagrams((prev) => prev.filter((d) => d.diagramId !== diagramId))
    if (activeDiagram?.diagramId === diagramId) {
      const remaining = diagrams.filter((d) => d.diagramId !== diagramId)
      if (remaining.length > 0) {
        setActiveDiagram(remaining[0])
      } else {
        setActiveDiagram(null)
        setView('library')
      }
    }
  }

  // Switch active diagram
  const handleSelectDiagram = (diag: DiagramItem) => {
    setActiveDiagram(diag)
    setView('editor')
    setIsDiagramDropdownOpen(false)
    if (project) {
      startTransition(() => {
        router.push(`/app/workspace?projectId=${project.id}&diagramId=${diag.diagramId}&view=editor`)
      })
    }
  }

  // Switch project
  const handleSelectProject = (proj: StudioProject) => {
    setIsProjectDropdownOpen(false)
    startTransition(() => {
      router.push(`/app/workspace?projectId=${proj.id}&view=library`)
    })
  }

  // Create new project from modal
  const handleConfirmCreateProject = async (
    name: string,
    description: string,
    projectType: ProjectType
  ) => {
    const { project: newProj, diagrams: newDiags } = await createProjectWithTemplate({
      name,
      description,
      projectType,
      ownerId: project?.createdBy || 'user',
    })

    setAllProjects((prev) => [newProj, ...prev])
    setProject(newProj)
    setDiagrams(newDiags)
    if (newDiags.length > 0) {
      setActiveDiagram(newDiags[0])
      setView('editor')
    } else {
      setActiveDiagram(null)
      setView('library')
    }

    startTransition(() => {
      router.push(`/app/workspace?projectId=${newProj.id}&view=library`)
    })
  }

  // Excalidraw change handler
  const handleExcalidrawChange = useCallback(
    (elements: readonly ExcalidrawElement[], _appState: AppState, files: BinaryFiles) => {
      handleSaveActiveDiagram({ elements, files })
    },
    [handleSaveActiveDiagram]
  )

  // React Flow change handler
  const handleReactFlowChange = useCallback(
    (data: { nodes: Node[]; edges: Edge[] }) => {
      handleSaveActiveDiagram(data)
    },
    [handleSaveActiveDiagram]
  )

  // GoJS change handler
  const handleGoJSChange = useCallback(
    (data: { nodeDataArray: unknown[]; linkDataArray: unknown[] }) => {
      handleSaveActiveDiagram(data)
    },
    [handleSaveActiveDiagram]
  )

  const activeEngine = activeDiagram?.engine || 'excalidraw'
  const engineCap = ENGINE_CAPABILITIES[activeEngine]

  return (
    <main className="flex h-dvh min-h-[580px] flex-col overflow-hidden bg-white text-gray-900">
      {/* ── Studio Header & Breadcrumbs (Section 12) ────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 z-20">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/app/dashboard"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
            title="Back to Dashboard"
          >
            <Diamond className="size-4" />
          </Link>

          {/* Breadcrumb Navigation: Projects / [Project Name] / [Diagram Name] */}
          <nav className="flex items-center gap-1.5 text-xs">
            <Link
              href="/app/dashboard"
              className="text-gray-400 hover:text-gray-700 transition hidden sm:inline"
            >
              Projects
            </Link>
            <ChevronRight className="size-3 text-gray-300 hidden sm:inline" />

            {/* Project Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsProjectDropdownOpen(!isProjectDropdownOpen)
                  setIsDiagramDropdownOpen(false)
                }}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 font-bold text-gray-800 hover:bg-gray-100 transition cursor-pointer max-w-44 truncate"
              >
                <FolderOpen className="size-3.5 text-red-600 shrink-0" />
                <span className="truncate">{project?.name || 'Project'}</span>
                <ChevronDown className="size-3 text-gray-400 shrink-0" />
              </button>

              {isProjectDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-64 rounded-xl border border-gray-200 bg-white py-1 shadow-xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 flex items-center justify-between">
                    <span>Switch Project</span>
                    <span className="text-[9px] text-gray-400">{allProjects.length} total</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {allProjects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectProject(p)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition cursor-pointer ${
                          p.id === project?.id
                            ? 'bg-red-50 text-red-600 font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        {p.id === project?.id && <Check className="size-3.5 text-red-600 shrink-0 ml-2" />}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 p-1">
                    <button
                      onClick={() => {
                        setIsProjectDropdownOpen(false)
                        setIsCreateProjectModalOpen(true)
                      }}
                      className="w-full flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>+ Create New Project</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Active Diagram Breadcrumb */}
            {activeDiagram && view === 'editor' && (
              <>
                <ChevronRight className="size-3 text-gray-300" />
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDiagramDropdownOpen(!isDiagramDropdownOpen)
                      setIsProjectDropdownOpen(false)
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50/80 px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-100 transition cursor-pointer max-w-52 truncate"
                  >
                    <span className="truncate">{activeDiagram.name}</span>
                    <ChevronDown className="size-3 shrink-0 text-gray-400" />
                  </button>

                  {/* Diagram Switcher Dropdown */}
                  {isDiagramDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-64 rounded-xl border border-gray-200 bg-white py-1 shadow-xl z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                        Switch Diagram
                      </div>
                      <div className="max-h-56 overflow-y-auto py-1">
                        {diagrams.map((d) => (
                          <button
                            key={d.diagramId}
                            onClick={() => handleSelectDiagram(d)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition cursor-pointer ${
                              d.diagramId === activeDiagram.diagramId
                                ? 'bg-red-50 text-red-600 font-semibold'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span className="truncate">{d.name}</span>
                            <span className="text-[10px] uppercase text-gray-400 shrink-0 ml-2">
                              {d.engine}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 p-1">
                        <button
                          onClick={() => {
                            setIsDiagramDropdownOpen(false)
                            setIsSelectorOpen(true)
                          }}
                          className="w-full flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Plus className="size-3.5" />
                          <span>+ Create Diagram</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          <span className="hidden h-5 w-px bg-gray-200 md:block" />

          {/* Engine Indicator badge (Section 26 & 4) */}
          {view === 'editor' && activeDiagram && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold capitalize ${
                activeEngine === 'reactflow'
                  ? 'border-teal-200 bg-teal-50 text-teal-700'
                  : activeEngine === 'gojs'
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-purple-200 bg-purple-50 text-purple-700'
              }`}
              title={engineCap.description}
            >
              <span className="size-1.5 rounded-full bg-current" />
              <span>Engine: {engineCap.displayName}</span>
            </div>
          )}
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <button
            type="button"
            onClick={() => setView(view === 'editor' ? 'library' : 'editor')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition cursor-pointer ${
              view === 'library'
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LayoutGrid className="size-3.5" />
            <span className="hidden sm:inline">
              {view === 'library' ? 'Project Overview' : 'All Diagrams'}
            </span>
          </button>

          {/* Create Diagram Prominent Button */}
          <button
            id="header-create-diagram-btn"
            type="button"
            onClick={() => setIsSelectorOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-red-700 transition cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>+ Create Diagram</span>
          </button>

          {view === 'editor' && (
            <>
              <span className="h-5 w-px bg-gray-200" />
              <button
                type="button"
                onClick={() => void handleSaveActiveDiagram(activeDiagram?.data)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                title="Save Diagram"
              >
                <Save className="size-3.5" />
                <span className="hidden sm:inline">Save</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── Studio Body ──────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } shrink-0 overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 flex flex-col z-10`}
        >
          <div className="p-3 border-b border-gray-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Project Diagrams ({diagrams.length})
              </span>
            </div>

            {/* Prominent Create Diagram Button */}
            <button
              id="sidebar-create-diagram-btn"
              onClick={() => setIsSelectorOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-red-700 active:scale-[0.99] transition cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>+ Create Diagram</span>
            </button>

            {/* Quick-Add Multi-Category Diagram Types */}
            <div className="space-y-2 pt-1 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Add New Diagram:
                </span>
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen(true)}
                  className="text-[10px] font-semibold text-red-600 hover:underline cursor-pointer"
                >
                  All (36) →
                </button>
              </div>

              {/* Quick Search */}
              <input
                type="text"
                placeholder="Search types (e.g. flow, erd, arch)..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/70 px-2 py-1 text-[11px] placeholder:text-gray-400 text-gray-800 focus:outline-none focus:border-red-600"
              />

              {/* Category Pills */}
              {!quickSearch && (
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                  {[
                    { id: 'popular', label: '⭐ Popular' },
                    { id: 'flow', label: 'Flow' },
                    { id: 'software', label: 'Arch' },
                    { id: 'database', label: 'Database' },
                    { id: 'security', label: 'Security' },
                    { id: 'uiux', label: 'UI/UX' },
                    { id: 'infra', label: 'Cloud' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setQuickCategory(tab.id)}
                      className={`px-1.5 py-0.5 rounded font-medium shrink-0 cursor-pointer transition ${
                        quickCategory === tab.id
                          ? 'bg-red-600 text-white font-bold'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Diagram Options Grid */}
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {sidebarDiagramOptions.slice(0, 12).map((diag: DiagramTypeDefinition) => {
                  const engineColor =
                    diag.recommendedEngine === 'reactflow'
                      ? 'border-teal-200 bg-teal-50/60 text-teal-700 hover:bg-teal-100'
                      : diag.recommendedEngine === 'gojs'
                      ? 'border-blue-200 bg-blue-50/60 text-blue-700 hover:bg-blue-100'
                      : 'border-purple-200 bg-purple-50/60 text-purple-700 hover:bg-purple-100'

                  return (
                    <button
                      key={diag.id}
                      type="button"
                      onClick={() => handleCreateQuickDiagram(diag.id)}
                      className={`w-full flex items-center justify-between gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-semibold transition cursor-pointer text-left ${engineColor}`}
                      title={diag.description}
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        <Plus className="size-3 shrink-0" />
                        <span className="truncate">{diag.name}</span>
                      </div>
                      <span className="text-[8px] uppercase tracking-wider opacity-75 shrink-0">
                        {diag.recommendedEngine.slice(0, 4)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Diagram Nav List */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            <button
              type="button"
              onClick={() => setView('library')}
              className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition text-left cursor-pointer ${
                view === 'library'
                  ? 'bg-red-50 text-red-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutGrid className="size-3.5" />
              <span>Overview &amp; Library</span>
            </button>

            <div className="pt-2 pb-1 px-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">
              Active Diagrams ({diagrams.length})
            </div>

            {diagrams.map((d) => {
              const isActive = activeDiagram?.diagramId === d.diagramId && view === 'editor'
              const engineColor =
                d.engine === 'reactflow'
                  ? 'bg-teal-500'
                  : d.engine === 'gojs'
                  ? 'bg-blue-500'
                  : 'bg-purple-500'

              return (
                <button
                  key={d.diagramId}
                  type="button"
                  onClick={() => handleSelectDiagram(d)}
                  className={`w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs text-left transition cursor-pointer ${
                    isActive
                      ? 'bg-red-50 text-red-600 font-semibold border-l-2 border-red-600 rounded-l-none'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`size-1.5 shrink-0 rounded-full ${engineColor}`} />
                    <span className="truncate">{d.name}</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 shrink-0">
                    {d.engine.slice(0, 4)}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Sidebar Footer Card */}
          <div className="p-3 border-t border-gray-100 bg-gray-50/60">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Engine Status</span>
              <span className="text-emerald-600 font-semibold">Active</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-normal">
              Unified multi-engine architecture.
            </p>
          </div>
        </aside>

        {/* ── Main View Area ───────────────────────────────────── */}
        <section className="flex min-w-0 flex-1 flex-col overflow-hidden relative">
          {/* Sub-toolbar when in Editor */}
          {view === 'editor' && (
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
                  title="Toggle sidebar"
                >
                  <PanelLeft className="size-3.5" />
                </button>
                <span className="text-gray-400">Category:</span>
                <span className="font-medium text-gray-700 capitalize">
                  {activeDiagram?.category.replace('-', ' ') || 'General'}
                </span>
                <span className="text-gray-300">/</span>
                <span className="font-medium text-gray-700">{activeDiagram?.type}</span>
              </div>

              <div className="flex items-center gap-3">
                {lastSavedTime && (
                  <span className="text-[10px] text-gray-400 hidden sm:inline">
                    Last saved at {lastSavedTime}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className={`size-1.5 rounded-full ${
                      status === 'Saving...' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                  <span>{status}</span>
                </span>
              </div>
            </div>
          )}

          {/* Content Switcher: Library vs Editor */}
          <div className="min-h-0 flex-1 overflow-hidden relative">
            {view === 'library' && project ? (
              <DiagramLibrary
                project={project}
                diagrams={diagrams}
                onOpenDiagram={handleSelectDiagram}
                onCreateDiagram={() => setIsSelectorOpen(true)}
                onCreateQuickDiagram={handleCreateQuickDiagram}
                onDuplicateDiagram={handleDuplicateDiagram}
                onRenameDiagram={handleRenameDiagram}
                onMoveDiagram={handleMoveDiagram}
                onDeleteDiagram={handleDeleteDiagram}
              />
            ) : activeDiagram ? (
              <div className="h-full w-full">
                {activeDiagram.engine === 'excalidraw' && (
                  <ExcalidrawEditor
                    key={activeDiagram.diagramId}
                    initialData={activeDiagram.data as { elements: readonly ExcalidrawElement[] }}
                    onChange={handleExcalidrawChange}
                  />
                )}
                {activeDiagram.engine === 'reactflow' && (
                  <ReactFlowEditor
                    key={activeDiagram.diagramId}
                    initialData={activeDiagram.data as { nodes?: Node[]; edges?: Edge[] }}
                    diagramType={activeDiagram.type}
                    onChange={handleReactFlowChange}
                  />
                )}
                {activeDiagram.engine === 'gojs' && (
                  <GoJSEditor
                    key={activeDiagram.diagramId}
                    initialData={activeDiagram.data as { nodeDataArray?: unknown[]; linkDataArray?: unknown[] }}
                    diagramType={activeDiagram.type}
                    onChange={handleGoJSChange}
                  />
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <p className="text-sm font-semibold text-gray-700">No active diagram</p>
                <button
                  onClick={() => setIsSelectorOpen(true)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Create Diagram</span>
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="flex h-7 shrink-0 items-center justify-between border-t border-gray-200 bg-white px-4 text-[10px] text-gray-400">
        <div className="flex items-center gap-2">
          <span>Project: {project?.name || 'Untitled'}</span>
          <span>·</span>
          <span>Diagrams: {diagrams.length}</span>
        </div>
        <div className="flex items-center gap-3">
          {activeDiagram && view === 'editor' && (
            <span className="font-semibold text-gray-600">
              Active: {engineCap.displayName}
            </span>
          )}
          <span>Local-first storage active</span>
        </div>
      </footer>

      {/* ── Diagram Type Selector Modal ──────────────────────── */}
      <DiagramTypeSelector
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={handleConfirmCreateDiagram}
      />

      {/* ── Create Project Modal ─────────────────────────────── */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onCreate={handleConfirmCreateProject}
      />
    </main>
  )
}
