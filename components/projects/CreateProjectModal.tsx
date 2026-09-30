'use client'

import { useState } from 'react'
import type { ProjectType } from '@/lib/diagram/types'
import { PROJECT_TEMPLATES } from '@/lib/diagram/types'
import {
  X,
  FolderPlus,
  Boxes,
  Layers,
  Palette,
  Database,
  Shield,
  Cloud,
  Kanban,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ElementType> = {
  FolderPlus,
  Boxes,
  Layers,
  Palette,
  Database,
  Shield,
  Cloud,
  Kanban,
  Sparkles,
}

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, description: string, projectType: ProjectType) => void
}

export function CreateProjectModal({ isOpen, onClose, onCreate }: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [projectType, setProjectType] = useState<ProjectType>('software-engineering')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter a project name.')
      return
    }
    onCreate(name.trim(), description.trim(), projectType)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="relative flex flex-col h-[90vh] max-h-[760px] w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Create New Project</h2>
            <p className="text-xs text-gray-500">
              Projects act as containers for unlimited independent diagrams and architectures.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden">
          <div className="overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="e.g. E-Commerce Platform or Hospital Management System"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                  Project Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Complete software architecture and engineering design suite"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            {/* Project Type & Templates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Project Type
                </label>
                <span className="text-[11px] text-gray-400">
                  Initializes starter templates
                </span>
              </div>

              {/* Informational banner about freedom */}
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/60 p-2.5 text-[11px] text-blue-800">
                <Info className="size-3.5 shrink-0 mt-0.5 text-blue-600" />
                <span>
                  <strong>Tip:</strong> Project type does NOT restrict what you can design. You can add Flowcharts, ERDs, UML, Security, or Whiteboard diagrams to any project at any time.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PROJECT_TEMPLATES.map((tmpl) => {
                  const Icon = ICON_MAP[tmpl.iconName] || FolderPlus
                  const isSelected = projectType === tmpl.id

                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setProjectType(tmpl.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-red-600 bg-red-50/20 ring-1 ring-red-600 shadow-2xs'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-2xs'
                      }`}
                    >
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                          isSelected
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-gray-900 truncate">
                            {tmpl.label}
                          </h4>
                          {tmpl.defaultDiagramTypes.length === 0 ? (
                            <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded font-medium">
                              Empty
                            </span>
                          ) : (
                            <span className="text-[9px] text-red-600 bg-red-50 px-1.5 py-0.2 rounded font-medium">
                              {tmpl.defaultDiagramTypes.length} docs
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {tmpl.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-gray-100 bg-gray-50/80 px-6 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 active:scale-[0.99] transition cursor-pointer"
            >
              <span>Create Project</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
