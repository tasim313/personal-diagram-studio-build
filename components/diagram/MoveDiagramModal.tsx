'use client'

import { useEffect, useState } from 'react'
import { X, FolderInput, Check } from 'lucide-react'
import type { DiagramItem, StudioProject } from '@/lib/diagram/types'
import { getAllProjects } from '@/lib/storage/diagrams'

interface MoveDiagramModalProps {
  isOpen: boolean
  diagram: DiagramItem | null
  currentProjectId: string
  onClose: () => void
  onMove: (diagramId: string, targetProjectId: string) => void
}

export function MoveDiagramModal({
  isOpen,
  diagram,
  currentProjectId,
  onClose,
  onMove,
}: MoveDiagramModalProps) {
  const [projects, setProjects] = useState<StudioProject[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    async function fetchProjects() {
      try {
        setLoading(true)
        const all = await getAllProjects()
        const otherProjects = all.filter((p) => p.id !== currentProjectId)
        setProjects(otherProjects)
        if (otherProjects.length > 0) {
          setSelectedProjectId(otherProjects[0].id)
        }
      } catch (err) {
        console.error('[move-modal] Failed to load projects:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [isOpen, currentProjectId])

  if (!isOpen || !diagram) return null

  const handleConfirm = () => {
    if (!selectedProjectId) return
    onMove(diagram.diagramId, selectedProjectId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <FolderInput className="size-4" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Move Diagram to Project</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-600">
            Select the destination project for{' '}
            <strong className="text-gray-900">&quot;{diagram.name}&quot;</strong>. Its content and engine data will remain completely intact.
          </p>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <span className="size-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center bg-gray-50/50">
              <p className="text-xs text-gray-500">
                No other projects available. Create a second project first to move diagrams between projects.
              </p>
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {projects.map((proj) => {
                const isSelected = selectedProjectId === proj.id
                return (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => setSelectedProjectId(proj.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-red-600 bg-red-50/30 ring-1 ring-red-600'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {proj.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate">
                        {proj.diagramIds?.length || 0} existing diagrams
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                        <Check className="size-3" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedProjectId || projects.length === 0}
              onClick={handleConfirm}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Move Diagram
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
