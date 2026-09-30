'use client'

import React, { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Layers,
  Sparkles,
} from 'lucide-react'
import type { DiagramItem } from '@/lib/diagram/types'
import type { Node, Edge } from 'reactflow'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'

const ExcalidrawEditor = dynamic(
  () => import('@/components/diagram/ExcalidrawEditor').then((m) => m.ExcalidrawEditor),
  { ssr: false }
)
const ReactFlowEditor = dynamic(
  () => import('@/components/diagram/ReactFlowEditor').then((m) => m.ReactFlowEditor),
  { ssr: false }
)
const GoJSEditor = dynamic(
  () => import('@/components/diagram/GoJSEditor').then((m) => m.GoJSEditor),
  { ssr: false }
)

interface PresentationModeProps {
  isOpen: boolean
  onClose: () => void
  diagrams: DiagramItem[]
  initialIndex?: number
  projectName?: string
}

export function PresentationMode({
  isOpen,
  onClose,
  diagrams,
  initialIndex = 0,
  projectName = 'Project Presentation',
}: PresentationModeProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAutoplay, setIsAutoplay] = useState(false)

  // Sync initialIndex when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, diagrams.length - 1)))
    }
  }, [isOpen, initialIndex, diagrams.length])

  const currentDiagram = diagrams[currentIndex]

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev < diagrams.length - 1 ? prev + 1 : 0))
  }, [diagrams.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : diagrams.length - 1))
  }, [diagrams.length])

  // Key navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextSlide()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevSlide()
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {})
        } else {
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, nextSlide, prevSlide, onClose])

  // Autoplay ticker
  useEffect(() => {
    if (!isOpen || !isAutoplay) return

    const timer = setInterval(() => {
      nextSlide()
    }, 6000)

    return () => clearInterval(timer)
  }, [isOpen, isAutoplay, nextSlide])

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  if (!isOpen || diagrams.length === 0 || !currentDiagram) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 text-white select-none animate-in fade-in">
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-lg bg-red-600 text-white font-bold text-xs">
            <Layers className="size-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-200 truncate max-w-sm">
              {projectName} • <span className="text-red-400">{currentDiagram.name}</span>
            </h1>
            <p className="text-[10px] text-slate-400">
              {currentDiagram.type} • Engine: {currentDiagram.engine.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Center slide counter */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700 text-xs font-bold text-slate-300">
          <Sparkles className="size-3 text-yellow-400" />
          <span>
            Slide {currentIndex + 1} of {diagrams.length}
          </span>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoplay(!isAutoplay)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition cursor-pointer ${
              isAutoplay
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Auto-advance slides every 6 seconds"
          >
            {isAutoplay ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            <span>{isAutoplay ? 'Playing' : 'Autoplay'}</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition cursor-pointer"
            title="Exit Presentation Mode (Esc)"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* ── Slide Canvas Container ───────────────────────────────── */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-white">
        {currentDiagram.engine === 'reactflow' ? (
          <ReactFlowEditor
            key={currentDiagram.diagramId}
            initialData={currentDiagram.data as { nodes?: Node[]; edges?: Edge[] }}
            diagramType={currentDiagram.type}
          />
        ) : currentDiagram.engine === 'gojs' ? (
          <GoJSEditor
            key={currentDiagram.diagramId}
            initialData={
              currentDiagram.data as { nodeDataArray?: unknown[]; linkDataArray?: unknown[] }
            }
            diagramType={currentDiagram.type}
          />
        ) : (
          <ExcalidrawEditor
            key={currentDiagram.diagramId}
            initialData={currentDiagram.data as { elements: readonly ExcalidrawElement[] }}
            onChange={() => {}}
          />
        )}
      </div>

      {/* ── Floating Navigation Dock ─────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-700/80 shadow-2xl">
        <button
          type="button"
          onClick={prevSlide}
          className="flex items-center gap-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs font-semibold border border-slate-700 cursor-pointer transition"
        >
          <ChevronLeft className="size-4" />
          <span>Previous</span>
        </button>

        {/* Slide Selector Dropdown */}
        <select
          value={currentIndex}
          onChange={(e) => setCurrentIndex(Number(e.target.value))}
          className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
        >
          {diagrams.map((d, idx) => (
            <option key={d.diagramId} value={idx}>
              {idx + 1}. {d.name} ({d.type})
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={nextSlide}
          className="flex items-center gap-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs font-semibold border border-slate-700 cursor-pointer transition"
        >
          <span>Next</span>
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
