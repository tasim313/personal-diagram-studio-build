'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import Link from 'next/link'
import {
  Diamond,
  FolderOpen,
  PenTool,
  Settings,
  LogOut,
  Plus,
  LayoutDashboard,
  Star,
  ExternalLink,
  Layers,
  Trash2,
} from 'lucide-react'
import type { ProjectType, StudioProject } from '@/lib/diagram/types'
import {
  createProjectWithTemplate,
  deleteStudioProject,
  getAllProjects,
} from '@/lib/storage/diagrams'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const user = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<StudioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null)

  useEffect(() => {
    async function loadProjects() {
      try {
        const list = await getAllProjects()
        setProjects(list)
      } catch (err) {
        console.error('[dashboard] Failed to load projects:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  async function handleConfirmCreateProject(
    name: string,
    description: string,
    projectType: ProjectType
  ) {
    try {
      const { project } = await createProjectWithTemplate({
        name,
        description,
        projectType,
        ownerId: user.email || 'user',
      })
      router.push(`/app/workspace?projectId=${project.id}`)
    } catch (err) {
      console.error('[dashboard] Failed to create project:', err)
    }
  }

  async function handleDeleteProject(projectId: string, projectName: string) {
    const confirmed = window.confirm(
      `Delete project "${projectName}"? All diagrams inside this project will be removed.`
    )
    if (!confirmed) return

    setDeletingProjectId(projectId)
    try {
      await deleteStudioProject(projectId)
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
    } catch (err) {
      console.error('[dashboard] Failed to delete project:', err)
    } finally {
      setDeletingProjectId(null)
    }
  }

  async function handleSignOut() {
    await fetch('/api/auth/sign-out', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ───────────────────────────────────── */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-red-600">
              <Diamond className="size-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800">
              Visual Engineering Studio
            </span>
            <span className="hidden rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600 sm:inline">
              Enterprise
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-400 md:inline">
              {user.email}
            </span>
            {user.picture && (
              <img
                src={user.picture}
                alt=""
                className="size-7 rounded-full"
                referrerPolicy="no-referrer"
              />
            )}
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:text-gray-700 transition cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ── Sidebar ──────────────────────────────────── */}
        <aside className="hidden w-56 shrink-0 border-r border-gray-100 lg:block min-h-[calc(100vh-3.5rem)]">
          <nav className="space-y-1 p-4">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Workspace
            </p>
            <Link
              href="/app/dashboard"
              className="flex items-center gap-2.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
            <Link
              href="/app/workspace"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              <PenTool className="size-4" />
              Studio Workspace
            </Link>
            <div className="!mt-6">
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Library
              </p>
            </div>
            <Link
              href="/app/dashboard"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              <FolderOpen className="size-4" />
              My Projects
            </Link>
            <div className="!mt-6">
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                System
              </p>
            </div>
            <Link
              href="/app/dashboard"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition"
            >
              <Settings className="size-4" />
              Settings
            </Link>
          </nav>
        </aside>

        {/* ── Main ─────────────────────────────────────── */}
        <main className="flex-1 p-6 sm:p-8">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Welcome, {user.name || 'Engineer'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Your multi-engine visual engineering workspace
            </p>

            {/* Quick Stats */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Projects', value: String(projects.length), icon: FolderOpen },
                {
                  label: 'Total Diagrams',
                  value: String(projects.reduce((acc, p) => acc + (p.diagramIds?.length || 0), 0)),
                  icon: Layers,
                },
                { label: 'Diagram Engines', value: '3 Active (Excalidraw, React Flow, GoJS)', icon: Star },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-gray-100 p-5 bg-white shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">
                      {s.label}
                    </span>
                    <s.icon className="size-4 text-gray-300" />
                  </div>
                  <p className="mt-2 text-xl font-bold text-gray-900 truncate">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Projects Section */}
            <div className="mt-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Engineering Projects
                  </h2>
                  <p className="text-xs text-gray-400">
                    Independent project containers holding unlimited multi-engine diagrams
                  </p>
                </div>
                <button
                  id="dashboard-new-project-btn"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-red-700 transition cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>+ Create Project</span>
                </button>
              </div>

              {loading ? (
                <div className="mt-6 flex h-40 items-center justify-center rounded-xl border border-gray-100">
                  <span className="size-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                </div>
              ) : projects.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-gray-200 p-12 text-center bg-gray-50/50">
                  <FolderOpen className="mx-auto size-8 text-gray-400" />
                  <p className="mt-3 text-sm font-semibold text-gray-700">No projects yet</p>
                  <p className="mt-1 text-xs text-gray-400 max-w-sm mx-auto">
                    Create a blank project or start from an engineering architecture template.
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Create Project</span>
                  </button>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="flex flex-col justify-between p-5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs transition"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-gray-900 truncate">
                            {proj.name}
                          </h3>
                          <span className="shrink-0 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            {proj.diagramIds?.length || 0} Diagrams
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {proj.description || 'Visual diagram studio project'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-400 text-[11px]">
                          Updated {new Date(proj.updatedAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteProject(proj.id, proj.name)}
                            disabled={deletingProjectId === proj.id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Project"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                          <Link
                            href={`/app/workspace?projectId=${proj.id}`}
                            className="inline-flex items-center gap-1 font-semibold text-red-600 hover:text-red-700"
                          >
                            <span>Open Studio</span>
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Session Info */}
            <div className="mt-10 rounded-xl border border-gray-100 p-5 bg-gray-50/50">
              <h2 className="text-sm font-semibold text-gray-700">
                Session Information
              </h2>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Signed in as</span>
                  <span className="font-medium text-gray-700">
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Authentication</span>
                  <span className="font-medium text-gray-700">Email &amp; Password</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Session type</span>
                  <span className="font-medium text-gray-700">
                    Server-managed · HttpOnly
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Create Project Modal (Section 6 & 23) ────────────────── */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleConfirmCreateProject}
      />
    </div>
  )
}
