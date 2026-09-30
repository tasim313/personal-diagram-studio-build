'use client'

import { useMemo, useState } from 'react'
import type { DiagramCategory, DiagramItem, StudioProject } from '@/lib/diagram/types'
import { DIAGRAM_CATEGORIES, DIAGRAM_CATALOG } from '@/lib/diagram/types'
import {
  Plus,
  Search,
  FolderOpen,
  Copy,
  Trash2,
  ExternalLink,
  Download,
  Edit3,
  FolderInput,
  MoreVertical,
  Clock,
  ArrowUpDown,
  PenTool,
  GitBranch,
  Activity,
  Database,
  Cpu,
} from 'lucide-react'
import { RenameDiagramModal } from './RenameDiagramModal'
import { MoveDiagramModal } from './MoveDiagramModal'
import { DeleteDiagramDialog } from './DeleteDiagramDialog'

type SortOption = 'updated-desc' | 'created-desc' | 'name-asc' | 'name-desc'

interface DiagramLibraryProps {
  project: StudioProject
  diagrams: DiagramItem[]
  onOpenDiagram: (diagram: DiagramItem) => void
  onCreateDiagram: () => void
  onCreateQuickDiagram?: (typeId: string) => void
  onDuplicateDiagram: (diagram: DiagramItem) => void
  onRenameDiagram: (diagramId: string, newName: string) => void
  onMoveDiagram: (diagramId: string, targetProjectId: string) => void
  onDeleteDiagram: (diagramId: string) => void
  onExportDiagram?: (diagram: DiagramItem) => void
}

export function DiagramLibrary({
  project,
  diagrams,
  onOpenDiagram,
  onCreateDiagram,
  onCreateQuickDiagram,
  onDuplicateDiagram,
  onRenameDiagram,
  onMoveDiagram,
  onDeleteDiagram,
  onExportDiagram,
}: DiagramLibraryProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<DiagramCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('updated-desc')

  // Modals state
  const [renameTarget, setRenameTarget] = useState<DiagramItem | null>(null)
  const [moveTarget, setMoveTarget] = useState<DiagramItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DiagramItem | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Filter & Sort diagrams
  const processedDiagrams = useMemo(() => {
    const filtered = diagrams.filter((d) => {
      const matchesCategory = categoryFilter === 'all' || d.category === categoryFilter
      if (!matchesCategory) return false

      const q = search.trim().toLowerCase()
      if (!q) return true

      return (
        d.name.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.engine.toLowerCase().includes(q)
      )
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'updated-desc':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'created-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        default:
          return 0
      }
    })
  }, [diagrams, categoryFilter, search, sortBy])

  // Count engines
  const engineStats = useMemo(() => {
    const counts = { excalidraw: 0, reactflow: 0, gojs: 0 }
    for (const d of diagrams) {
      if (d.engine in counts) {
        counts[d.engine as keyof typeof counts]++
      }
    }
    return counts
  }, [diagrams])

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-y-auto">
      {/* ── Section 10: Project Dashboard Overview ─────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-7 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
              <span>Projects</span>
              <span>/</span>
              <span className="font-semibold text-gray-800">{project.name}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl truncate">
              {project.name}
            </h1>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
              {project.description || 'Complete software architecture and engineering design suite.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="create-diagram-btn"
              onClick={onCreateDiagram}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 active:scale-[0.99] transition cursor-pointer"
            >
              <Plus className="size-4" />
              <span>+ Create Diagram</span>
            </button>
          </div>
        </div>

        {/* Dashboard Stat Badges (Section 10) */}
        <div className="max-w-7xl mx-auto mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-medium">Diagrams</span>
            <span className="text-lg font-bold text-gray-900 mt-0.5">{diagrams.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-medium">Last Updated</span>
            <span className="text-lg font-bold text-gray-900 mt-0.5">
              {diagrams.length > 0
                ? new Date(
                    Math.max(...diagrams.map((d) => new Date(d.updatedAt).getTime()))
                  ).toLocaleDateString()
                : 'Just now'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-medium">Engines in Use</span>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold">
              <span className="text-purple-600">{engineStats.excalidraw} Excal</span>
              <span className="text-gray-300">·</span>
              <span className="text-teal-600">{engineStats.reactflow} Flow</span>
              <span className="text-gray-300">·</span>
              <span className="text-blue-600">{engineStats.gojs} GoJS</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-medium">Project Architecture</span>
            <span className="text-xs font-semibold text-gray-700 capitalize mt-1 truncate">
              {project.projectType?.replace('-', ' ') || 'Software Engineering'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 11: Filter, Search & Sort Toolbar ──────────────────────────── */}
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          {/* Search diagrams */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search diagrams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 shadow-2xs"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="size-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 focus:border-red-600 focus:outline-none cursor-pointer"
            >
              <option value="updated-desc">Recently Updated</option>
              <option value="created-desc">Recently Created</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills (Section 11) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`shrink-0 rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({diagrams.length})
          </button>
          {DIAGRAM_CATEGORIES.map((cat) => {
            const count = diagrams.filter((d) => d.category === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.label} ({count})
              </button>
            )
          })}
        </div>

        {/* ── Section 7 & 22: Empty Project Experience ─────────────────────── */}
        {diagrams.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-14 px-6 text-center shadow-xs">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4">
              <FolderOpen className="size-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Your project is empty</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md">
              Start designing by creating your first diagram. Projects can contain unlimited diagrams across any engine or architecture.
            </p>

            <button
              onClick={onCreateDiagram}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition cursor-pointer"
            >
              <Plus className="size-4" />
              <span>+ Create Diagram</span>
            </button>

            {/* Quick Actions (Section 22) */}
            <div className="mt-8 pt-6 border-t border-gray-100 w-full max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Quick start with popular diagram types:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { id: 'freeform', label: 'Excalidraw', icon: PenTool },
                  { id: 'flowchart', label: 'Flowchart', icon: GitBranch },
                  { id: 'activity-diagram', label: 'Activity', icon: Activity },
                  { id: 'erd', label: 'ERD', icon: Database },
                  { id: 'system-architecture', label: 'Architecture', icon: Cpu },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (onCreateQuickDiagram) {
                        onCreateQuickDiagram(item.id)
                      } else {
                        onCreateDiagram()
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-white hover:border-red-500 hover:text-red-600 hover:shadow-2xs transition cursor-pointer"
                  >
                    <item.icon className="size-3.5 text-gray-500" />
                    <span>[ {item.label} ]</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : processedDiagrams.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-12 px-4 text-center">
            <h3 className="text-sm font-bold text-gray-900">No matching diagrams</h3>
            <p className="text-xs text-gray-400 mt-1">
              No diagrams matched your filter or search query.
            </p>
            <button
              onClick={() => {
                setSearch('')
                setCategoryFilter('all')
              }}
              className="mt-4 text-xs font-semibold text-red-600 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* ── Section 10: Diagram Cards Grid ───────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {processedDiagrams.map((diag) => {
              const def = DIAGRAM_CATALOG.find((c) => c.id === diag.type)
              const engineColor =
                diag.engine === 'reactflow'
                  ? 'text-teal-700 bg-teal-50 border-teal-200'
                  : diag.engine === 'gojs'
                  ? 'text-blue-700 bg-blue-50 border-blue-200'
                  : 'text-purple-700 bg-purple-50 border-purple-200'

              const isMenuOpen = openMenuId === diag.diagramId

              return (
                <div
                  key={diag.diagramId}
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xs hover:border-gray-300 hover:shadow-md transition relative"
                >
                  {/* Thumbnail / Header */}
                  <div
                    onClick={() => onOpenDiagram(diag)}
                    className="h-36 bg-gradient-to-br from-gray-50 to-gray-100/70 p-4 border-b border-gray-100 flex flex-col justify-between cursor-pointer relative overflow-hidden group-hover:from-gray-100/50 group-hover:to-red-50/20 transition rounded-t-2xl"
                  >
                    <div className="flex items-center justify-between z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {def?.name || diag.type}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${engineColor}`}
                      >
                        {diag.engine}
                      </span>
                    </div>

                    {/* Canvas center button */}
                    <div className="flex items-center justify-center text-gray-400 group-hover:scale-105 transition">
                      <div className="flex items-center gap-1.5 rounded-lg bg-white/90 border border-gray-200/80 px-3 py-1.5 shadow-2xs">
                        <ExternalLink className="size-3 text-gray-600" />
                        <span className="text-[11px] font-semibold text-gray-800">Open</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 z-10">
                      <span className="capitalize">{diag.category.replace('-', ' ')}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(diag.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => onOpenDiagram(diag)}
                          className="text-sm font-bold text-gray-900 hover:text-red-600 transition cursor-pointer truncate"
                          title={diag.name}
                        >
                          {diag.name}
                        </h4>

                        {/* Card Context Menu Button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(isMenuOpen ? null : diag.diagramId)
                            }}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                            title="More actions"
                          >
                            <MoreVertical className="size-3.5" />
                          </button>

                          {/* Context Menu Dropdown */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-lg z-30 animate-in fade-in zoom-in-95 text-xs text-gray-700"
                            >
                              <button
                                onClick={() => {
                                  setOpenMenuId(null)
                                  setRenameTarget(diag)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition cursor-pointer"
                              >
                                <Edit3 className="size-3.5 text-gray-500" />
                                <span>Rename</span>
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null)
                                  onDuplicateDiagram(diag)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition cursor-pointer"
                              >
                                <Copy className="size-3.5 text-gray-500" />
                                <span>Duplicate</span>
                              </button>
                              <button
                                onClick={() => {
                                  setOpenMenuId(null)
                                  setMoveTarget(diag)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition cursor-pointer"
                              >
                                <FolderInput className="size-3.5 text-gray-500" />
                                <span>Move to Project</span>
                              </button>
                              {onExportDiagram && (
                                <button
                                  onClick={() => {
                                    setOpenMenuId(null)
                                    onExportDiagram(diag)
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition cursor-pointer"
                                >
                                  <Download className="size-3.5 text-gray-500" />
                                  <span>Export</span>
                                </button>
                              )}
                              <div className="border-t border-gray-100 my-1" />
                              <button
                                onClick={() => {
                                  setOpenMenuId(null)
                                  setDeleteTarget(diag)
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 transition cursor-pointer"
                              >
                                <Trash2 className="size-3.5 text-red-600" />
                                <span>Delete Diagram</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {def?.description || 'Independent engineering diagram'}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                      <button
                        onClick={() => onOpenDiagram(diag)}
                        className="font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        Open Editor →
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setRenameTarget(diag)}
                          title="Rename"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
                        >
                          <Edit3 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicateDiagram(diag)}
                          title="Duplicate"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
                        >
                          <Copy className="size-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(diag)}
                          title="Delete"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modals for Diagram Operations ──────────────────────────── */}
      <RenameDiagramModal
        isOpen={Boolean(renameTarget)}
        diagram={renameTarget}
        onClose={() => setRenameTarget(null)}
        onRename={onRenameDiagram}
      />

      <MoveDiagramModal
        isOpen={Boolean(moveTarget)}
        diagram={moveTarget}
        currentProjectId={project.id}
        onClose={() => setMoveTarget(null)}
        onMove={onMoveDiagram}
      />

      <DeleteDiagramDialog
        isOpen={Boolean(deleteTarget)}
        diagram={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDeleteDiagram}
      />
    </div>
  )
}
