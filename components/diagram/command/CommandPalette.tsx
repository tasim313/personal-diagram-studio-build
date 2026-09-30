'use client'

import React, { useEffect, useState, useMemo } from 'react'
import {
  Search,
  Plus,
  Play,
  Download,
  FolderOpen,
  LayoutGrid,
  Save,
  Clock,
  Command,
} from 'lucide-react'
import { DIAGRAM_CATALOG, type DiagramItem, type DiagramTypeDefinition } from '@/lib/diagram/types'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  diagrams: DiagramItem[]
  activeDiagramId?: string
  onSelectDiagram: (diag: DiagramItem) => void
  onCreateDiagram: (def: DiagramTypeDefinition) => void
  onStartPresentation: () => void
  onOpenExport: () => void
  onSave: () => void
  onOpenLibrary: () => void
  onOpenVersionHistory: () => void
}

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  category: string
  icon: React.ComponentType<{ className?: string }>
  run: () => void
}

export function CommandPalette({
  isOpen,
  onClose,
  diagrams,
  activeDiagramId,
  onSelectDiagram,
  onCreateDiagram,
  onStartPresentation,
  onOpenExport,
  onSave,
  onOpenLibrary,
  onOpenVersionHistory,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Listen for global shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) {
          onClose()
        } else {
          setQuery('')
          setSelectedIndex(0)
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Filtered commands and items
  const filteredItems = useMemo<CommandItem[]>(() => {
    const q = query.trim().toLowerCase()

    // 1. Actions
    const actionItems: CommandItem[] = [
      {
        id: 'action-pres',
        title: 'Start Presentation Mode',
        category: 'Actions',
        icon: Play,
        run: onStartPresentation,
      },
      {
        id: 'action-export',
        title: 'Export Diagram (PNG, SVG, JSON)',
        category: 'Actions',
        icon: Download,
        run: onOpenExport,
      },
      {
        id: 'action-save',
        title: 'Save Diagram Now',
        category: 'Actions',
        icon: Save,
        run: onSave,
      },
      {
        id: 'action-version',
        title: 'Version History & Snapshots',
        category: 'Actions',
        icon: Clock,
        run: onOpenVersionHistory,
      },
      {
        id: 'action-lib',
        title: 'Switch to Project Diagram Library',
        category: 'Actions',
        icon: LayoutGrid,
        run: onOpenLibrary,
      },
    ].filter((a) => !q || a.title.toLowerCase().includes(q))

    // 2. Diagrams in Project
    const diagramItems = diagrams
      .filter((d) => !q || d.name.toLowerCase().includes(q) || d.type.toLowerCase().includes(q))
      .map((d) => ({
        id: `diag-${d.diagramId}`,
        title: `Switch to: ${d.name}${d.diagramId === activeDiagramId ? ' (Active)' : ''}`,
        subtitle: `${d.type} • ${d.engine.toUpperCase()}`,
        category: 'Diagrams',
        icon: FolderOpen,
        run: () => onSelectDiagram(d),
      }))

    // 3. Create Any Diagram Type (All 36 catalog entries)
    const createItems = DIAGRAM_CATALOG.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    ).map((c) => ({
      id: `create-${c.id}`,
      title: `Create: ${c.name}`,
      subtitle: `${c.category} • ${c.recommendedEngine}`,
      category: 'Create Diagram',
      icon: Plus,
      run: () => onCreateDiagram(c),
    }))

    return [...actionItems, ...diagramItems, ...createItems]
  }, [
    query,
    diagrams,
    onStartPresentation,
    onOpenExport,
    onSave,
    onOpenVersionHistory,
    onOpenLibrary,
    onSelectDiagram,
    onCreateDiagram,
  ])

  // Reset index when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Key navigation in list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].run()
        onClose()
      }
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <Search className="size-4 text-gray-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search diagrams... (e.g. 'flowchart', 'export')"
            className="w-full text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
          />
          <div className="flex items-center gap-1 bg-gray-100 text-[10px] font-semibold text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 shrink-0">
            <span>ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              No matching commands or diagrams found for &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon
              const isSelected = index === selectedIndex
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.run()
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition ${
                    isSelected ? 'bg-red-50 text-red-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold leading-tight truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[10px] text-gray-400 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold text-gray-400 px-2 py-0.5 rounded bg-gray-100 shrink-0 ml-2">
                    {item.category}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2 bg-slate-50 text-[11px] text-gray-500">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="size-3" />
            <span>K to toggle palette</span>
          </div>
        </div>
      </div>
    </div>
  )
}
