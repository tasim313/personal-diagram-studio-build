'use client'

import { useMemo, useState } from 'react'
import type { DiagramCategory, DiagramEngineType, DiagramTypeDefinition } from '@/lib/diagram/types'
import {
  DIAGRAM_CATEGORIES,
  DIAGRAM_CATALOG,
  ENGINE_CAPABILITIES,
} from '@/lib/diagram/types'
import {
  Search,
  X,
  Sparkles,
  GitBranch,
  Workflow,
  Activity,
  GitCommit,
  GitFork,
  CircleDot,
  Navigation,
  Boxes,
  Layers,
  Cpu,
  ListOrdered,
  FileCode2,
  HardDrive,
  Radio,
  Server,
  Monitor,
  Database,
  TableProperties,
  ArrowRightLeft,
  HardDriveDownload,
  Shield,
  ShieldAlert,
  KeyRound,
  Lock,
  Network,
  ShieldCheck,
  LayoutGrid,
  Compass,
  Smartphone,
  Palette,
  Router,
  Cloud,
  ServerCrash,
  GitPullRequest,
  RefreshCw,
  Kanban,
  Milestone,
  Clock,
  GitCompare,
  Columns3,
  Flag,
  PenTool,
  Layout,
  Check,
  ChevronRight,
  Zap,
} from 'lucide-react'

// Icon resolver map
const ICON_MAP: Record<string, React.ElementType> = {
  PenTool,
  Sparkles,
  Layout,
  GitBranch,
  Workflow,
  Activity,
  GitCommit,
  GitFork,
  CircleDot,
  Navigation,
  Boxes,
  Layers,
  Cpu,
  ListOrdered,
  FileCode2,
  HardDrive,
  Radio,
  Server,
  Monitor,
  Database,
  TableProperties,
  ArrowRightLeft,
  HardDriveDownload,
  Shield,
  ShieldAlert,
  KeyRound,
  Lock,
  Network,
  ShieldCheck,
  LayoutGrid,
  Compass,
  Smartphone,
  Palette,
  Router,
  Cloud,
  ServerCrash,
  GitPullRequest,
  RefreshCw,
  Kanban,
  Milestone,
  Clock,
  GitCompare,
  Columns3,
  Flag,
}

interface DiagramTypeSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (typeDef: DiagramTypeDefinition, name: string, engine: DiagramEngineType) => void
}

export function DiagramTypeSelector({ isOpen, onClose, onSelect }: DiagramTypeSelectorProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<DiagramCategory | 'all'>('all')

  // Find flowchart by default or catalog[0]
  const defaultItem = DIAGRAM_CATALOG.find((d) => d.id === 'flowchart') || DIAGRAM_CATALOG[0]
  const [selectedType, setSelectedType] = useState<DiagramTypeDefinition>(defaultItem)
  const [customName, setCustomName] = useState(defaultItem.name)
  const [selectedEngine, setSelectedEngine] = useState<DiagramEngineType>(defaultItem.recommendedEngine)

  // Filter catalog based on category and search query
  const filteredCatalog = useMemo(() => {
    return DIAGRAM_CATALOG.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const query = search.trim().toLowerCase()
      if (!query) return matchesCategory

      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some((t) => t.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, search])

  // Grouped by categories
  const groupedCategories = useMemo(() => {
    return DIAGRAM_CATEGORIES.map((cat) => {
      const items = filteredCatalog.filter((item) => item.category === cat.id)
      return {
        ...cat,
        items,
      }
    }).filter((cat) => cat.items.length > 0)
  }, [filteredCatalog])

  const handleSelectCard = (item: DiagramTypeDefinition) => {
    setSelectedType(item)
    setCustomName(item.name)
    setSelectedEngine(item.recommendedEngine)
  }

  const handleConfirmCreate = () => {
    onSelect(selectedType, customName.trim() || selectedType.name, selectedEngine)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative flex flex-col h-[92vh] max-h-[840px] w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        {/* ── Modal Header ─────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-red-600 text-white">
                <GitBranch className="size-4" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Create New Diagram</h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Select any diagram type: Flowcharts, ERDs, System Architecture, UML, or Freeform canvas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ── Popular Quick-Picks Banner ───────────────────────── */}
        <div className="bg-gradient-to-r from-red-50 via-white to-orange-50 border-b border-gray-200/80 px-6 py-2.5 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-bold text-gray-600 flex items-center gap-1 shrink-0 text-[11px] uppercase tracking-wider">
            <Zap className="size-3.5 text-amber-500" />
            Quick Pick:
          </span>
          {[
            { id: 'flowchart', label: 'Flowchart', engine: 'React Flow' },
            { id: 'erd', label: 'Database ERD', engine: 'GoJS' },
            { id: 'freeform', label: 'Freeform / Whiteboard', engine: 'Excalidraw' },
            { id: 'system-architecture', label: 'System Architecture', engine: 'React Flow' },
            { id: 'activity-diagram', label: 'Activity Diagram', engine: 'React Flow' },
          ].map((qp) => {
            const found = DIAGRAM_CATALOG.find((d) => d.id === qp.id)
            if (!found) return null
            const isSelected = selectedType.id === found.id
            return (
              <button
                key={qp.id}
                type="button"
                onClick={() => handleSelectCard(found)}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-red-400 hover:text-red-600'
                }`}
              >
                <span>{qp.label}</span>
                <span className="text-[9px] opacity-75 font-normal">({qp.engine})</span>
              </button>
            )
          })}
        </div>

        {/* ── Search & Categories Bar ──────────────────────────── */}
        <div className="border-b border-gray-100 px-6 py-3 bg-gray-50/50 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search diagram types (e.g. flowchart, erd, activity, security, aws)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition shadow-2xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`shrink-0 rounded-lg px-3 py-1 font-medium transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Categories ({DIAGRAM_CATALOG.length})
            </button>
            {DIAGRAM_CATEGORIES.map((cat) => {
              const count = DIAGRAM_CATALOG.filter((d) => d.category === cat.id).length
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 rounded-lg px-3 py-1 font-medium transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Main Content: Categorized View + Inspector ───────── */}
        <div className="flex min-h-0 flex-1 divide-x divide-gray-100 overflow-hidden">
          {/* Catalog Grouped View */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {groupedCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Search className="size-8 text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-700">No diagram types match your search</p>
                <p className="text-xs text-gray-400 mt-1">Try searching for &quot;flowchart&quot;, &quot;erd&quot;, or &quot;architecture&quot;.</p>
              </div>
            ) : (
              groupedCategories.map((group) => (
                <div key={group.id} className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
                      {group.label}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ({group.items.length} types)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.items.map((item) => {
                      const Icon = ICON_MAP[item.iconName] || Sparkles
                      const isSelected = selectedType.id === item.id
                      const engineColor =
                        item.recommendedEngine === 'reactflow'
                          ? 'text-teal-700 bg-teal-50 border-teal-200'
                          : item.recommendedEngine === 'gojs'
                          ? 'text-blue-700 bg-blue-50 border-blue-200'
                          : 'text-purple-700 bg-purple-50 border-purple-200'

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectCard(item)}
                          className={`flex flex-col text-left p-3.5 rounded-xl border transition cursor-pointer relative group ${
                            isSelected
                              ? 'border-red-600 bg-red-50/20 ring-1 ring-red-600 shadow-2xs'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-2">
                            <div
                              className={`flex size-8 items-center justify-center rounded-lg ${
                                isSelected
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-100 text-gray-700 group-hover:bg-red-50 group-hover:text-red-600'
                              } transition`}
                            >
                              <Icon className="size-4" />
                            </div>
                            <span
                              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border capitalize ${engineColor}`}
                            >
                              {item.recommendedEngine}
                            </span>
                          </div>

                          <h3 className="text-xs font-bold text-gray-900 group-hover:text-red-600 transition truncate">
                            {item.name}
                          </h3>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>

                          <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-gray-400">
                            <span>Engine: {item.recommendedEngine}</span>
                            {isSelected && <Check className="size-3.5 text-red-600 font-bold" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Inspector Panel: Configuration & Confirmation */}
          <div className="w-80 shrink-0 bg-gray-50/70 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                  Selected Diagram Type
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">
                  {selectedType.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {selectedType.description}
                </p>
              </div>

              {/* Diagram Name Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Diagram Title
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter diagram title..."
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Engine Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Execution Engine
                </label>
                <div className="space-y-2">
                  {(['reactflow', 'gojs', 'excalidraw'] as DiagramEngineType[]).map((eng) => {
                    const info = ENGINE_CAPABILITIES[eng]
                    const isRec = selectedType.recommendedEngine === eng
                    const isActive = selectedEngine === eng

                    return (
                      <button
                        key={eng}
                        type="button"
                        onClick={() => setSelectedEngine(eng)}
                        className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          isActive
                            ? 'border-red-600 bg-white ring-1 ring-red-600 shadow-2xs'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="mt-0.5 flex size-4 items-center justify-center rounded-full border border-gray-300">
                          {isActive && <div className="size-2 rounded-full bg-red-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-gray-800 capitalize">
                              {eng}
                            </span>
                            {isRec && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">
                            {info.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-gray-200 space-y-2">
              <button
                type="button"
                onClick={handleConfirmCreate}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-xs font-semibold text-white shadow-sm hover:bg-red-700 active:scale-[0.99] transition cursor-pointer"
              >
                <span>Create &amp; Open Diagram</span>
                <ChevronRight className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl border border-gray-200 bg-white py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
