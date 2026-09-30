'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Plus,
  RotateCcw,
  Check,
  Calendar,
  User,
  History,
} from 'lucide-react'
import type { DiagramItem } from '@/lib/diagram/types'
import {
  getDiagramSnapshots,
  createDiagramSnapshot,
  restoreDiagramSnapshot,
  type DiagramSnapshot,
} from '@/lib/storage/versioning'

interface VersionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  diagram: DiagramItem | null
  onRestore: (restored: DiagramItem) => void
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  diagram,
  onRestore,
}: VersionHistoryModalProps) {
  const [snapshots, setSnapshots] = useState<DiagramSnapshot[]>([])
  const [newDescription, setNewDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [restoredId, setRestoredId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && diagram) {
      setSnapshots(getDiagramSnapshots(diagram.diagramId))
    }
  }, [isOpen, diagram])

  if (!isOpen || !diagram) return null

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!diagram) return

    const newSnap = createDiagramSnapshot(diagram, newDescription || `Snapshot ${snapshots.length + 1}`)
    setSnapshots([newSnap, ...snapshots])
    setNewDescription('')
    setIsCreating(false)
  }

  const handleRestore = async (snap: DiagramSnapshot) => {
    if (!diagram) return
    const restored = await restoreDiagramSnapshot(diagram, snap)
    setRestoredId(snap.id)
    onRestore(restored)
    setTimeout(() => {
      setRestoredId(null)
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <History className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Version History</h2>
              <p className="text-xs text-gray-500">
                {diagram.name} • {snapshots.length} saved version{snapshots.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Create Snapshot Form */}
        <div className="p-4 bg-slate-50 border-b border-gray-100">
          {!isCreating ? (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 text-xs font-bold text-gray-800 hover:border-purple-300 hover:text-purple-600 shadow-2xs transition cursor-pointer"
            >
              <Plus className="size-4" />
              <span>Create New Version Snapshot</span>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="space-y-2">
              <input
                type="text"
                autoFocus
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description of changes (e.g. 'Added API Gateway & Database')..."
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-purple-600 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="rounded-lg px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Snapshot
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Snapshots List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {snapshots.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No snapshots created yet. Click above to save the current state as Version 1.
            </div>
          ) : (
            snapshots.map((snap) => (
              <div
                key={snap.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white transition shadow-2xs"
              >
                <div className="space-y-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[10px] font-bold text-purple-700">
                      v{snap.versionNumber}.0
                    </span>
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {snap.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      <span>{new Date(snap.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="size-3" />
                      <span>{snap.author}</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRestore(snap)}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold border transition cursor-pointer shrink-0 ${
                    restoredId === snap.id
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'border-gray-200 text-gray-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200'
                  }`}
                >
                  {restoredId === snap.id ? (
                    <>
                      <Check className="size-3.5 text-emerald-600" />
                      <span>Restored!</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="size-3.5" />
                      <span>Restore</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
