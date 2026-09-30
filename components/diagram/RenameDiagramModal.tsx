'use client'

import { useEffect, useState } from 'react'
import { X, Edit3 } from 'lucide-react'
import type { DiagramItem } from '@/lib/diagram/types'

interface RenameDiagramModalProps {
  isOpen: boolean
  diagram: DiagramItem | null
  onClose: () => void
  onRename: (diagramId: string, newName: string) => void
}

export function RenameDiagramModal({
  isOpen,
  diagram,
  onClose,
  onRename,
}: RenameDiagramModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (diagram) {
      setName(diagram.name)
      setError(null)
    }
  }, [diagram])

  if (!isOpen || !diagram) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Diagram name cannot be empty.')
      return
    }
    onRename(diagram.diagramId, trimmed)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Edit3 className="size-4" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Rename Diagram</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Diagram Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Type: {diagram.type} · Engine: {diagram.engine}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition cursor-pointer"
            >
              Save Name
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
