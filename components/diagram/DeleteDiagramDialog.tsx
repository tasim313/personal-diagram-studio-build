'use client'

import { AlertTriangle, X } from 'lucide-react'
import type { DiagramItem } from '@/lib/diagram/types'

interface DeleteDiagramDialogProps {
  isOpen: boolean
  diagram: DiagramItem | null
  onClose: () => void
  onConfirm: (diagramId: string) => void
}

export function DeleteDiagramDialog({
  isOpen,
  diagram,
  onClose,
  onConfirm,
}: DeleteDiagramDialogProps) {
  if (!isOpen || !diagram) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <AlertTriangle className="size-4" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Delete Diagram</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Are you sure you want to delete <strong className="text-gray-900">&quot;{diagram.name}&quot;</strong>?
          </p>

          <div className="rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs text-red-800">
            This diagram and its saved versions will be permanently removed from this project. This action cannot be undone.
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
              type="button"
              onClick={() => {
                onConfirm(diagram.diagramId)
                onClose()
              }}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition cursor-pointer"
            >
              Delete Diagram
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
