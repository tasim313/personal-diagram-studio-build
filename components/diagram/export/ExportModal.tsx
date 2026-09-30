'use client'

import React, { useState } from 'react'
import {
  X,
  Download,
  FileCode,
  Image as ImageIcon,
  FileText,
  Check,
  Sparkles,
} from 'lucide-react'
import type { DiagramItem } from '@/lib/diagram/types'
import { generateSqlFromErd, type ErdTableNode, type ErdLink } from '../sql/sqlParser'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  diagram: DiagramItem | null
  projectName?: string
}

export function ExportModal({
  isOpen,
  onClose,
  diagram,
  projectName = 'Project',
}: ExportModalProps) {
  const [exportingType, setExportingType] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen || !diagram) return null

  const sanitizeFilename = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'diagram'
  }

  // 1. Export JSON Source
  const handleExportJson = () => {
    setExportingType('json')
    const exportData = {
      version: 1,
      appName: 'Personal Diagram Studio',
      project: projectName,
      exportedAt: new Date().toISOString(),
      diagram: {
        id: diagram.diagramId,
        name: diagram.name,
        type: diagram.type,
        category: diagram.category,
        engine: diagram.engine,
        createdAt: diagram.createdAt,
        updatedAt: diagram.updatedAt,
        data: diagram.data,
      },
    }

    const jsonStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    downloadBlob(blob, `${sanitizeFilename(diagram.name)}.json`)
  }

  // 2. Export SVG Vector Graphic
  const handleExportSvg = () => {
    setExportingType('svg')
    try {
      // Find SVG elements inside current document canvas
      const svgEls = document.querySelectorAll('svg')
      let svgContent = ''

      // Look for the diagram canvas SVG
      for (let i = 0; i < svgEls.length; i++) {
        const svg = svgEls[i]
        if (svg.clientWidth > 200 || svg.clientHeight > 200 || svg.classList.contains('react-flow__edges')) {
          svgContent = new XMLSerializer().serializeToString(svg)
          break
        }
      }

      if (!svgContent) {
        // Fallback clean structured SVG
        svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <text x="50" y="60" font-family="sans-serif" font-size="20" font-weight="bold" fill="#1e293b">${diagram.name}</text>
  <text x="50" y="90" font-family="sans-serif" font-size="12" fill="#64748b">${diagram.type} • Engine: ${diagram.engine.toUpperCase()}</text>
</svg>`
      }

      const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
      downloadBlob(blob, `${sanitizeFilename(diagram.name)}.svg`)
    } catch (err) {
      console.error('Failed to export SVG:', err)
    }
  }

  // 3. Export PNG Image
  const handleExportPng = () => {
    setExportingType('png')
    try {
      // Look for HTML5 Canvas (GoJS or Excalidraw)
      const canvasEl = document.querySelector('canvas')
      if (canvasEl) {
        canvasEl.toBlob((blob) => {
          if (blob) {
            downloadBlob(blob, `${sanitizeFilename(diagram.name)}.png`)
          } else {
            fallbackPng()
          }
        }, 'image/png')
      } else {
        fallbackPng()
      }
    } catch (err) {
      console.error('Failed to export PNG:', err)
      fallbackPng()
    }
  }

  const fallbackPng = () => {
    // Render on offscreen canvas
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 800
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 28px sans-serif'
      ctx.fillText(diagram.name, 60, 80)
      ctx.fillStyle = '#64748b'
      ctx.font = '16px sans-serif'
      ctx.fillText(`${diagram.type} • Engine: ${diagram.engine.toUpperCase()}`, 60, 115)
      ctx.strokeStyle = '#e2e8f0'
      ctx.strokeRect(60, 140, 1080, 600)
    }
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${sanitizeFilename(diagram.name)}.png`)
    }, 'image/png')
  }

  // 4. Export SQL (for ERD)
  const handleExportSql = () => {
    setExportingType('sql')
    const erdData = diagram.data as {
      nodeDataArray?: ErdTableNode[]
      linkDataArray?: ErdLink[]
    }
    const sql = generateSqlFromErd(erdData?.nodeDataArray || [], erdData?.linkDataArray || [], 'postgres')
    const blob = new Blob([sql], { type: 'text/sql' })
    downloadBlob(blob, `${sanitizeFilename(diagram.name)}.sql`)
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setSuccessMessage(`Successfully exported ${filename}`)
    setTimeout(() => {
      setSuccessMessage(null)
      setExportingType(null)
      onClose()
    }, 1200)
  }

  const isDatabaseDiagram =
    diagram.category === 'database' || diagram.type.includes('erd') || diagram.engine === 'gojs'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-100 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Download className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Export Diagram</h2>
              <p className="text-xs text-gray-500">
                {diagram.name} • {diagram.type}
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

        {/* Success toast */}
        {successMessage && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 animate-in fade-in">
            <Check className="size-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Export Options Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Option 1: PNG */}
          <button
            type="button"
            onClick={handleExportPng}
            disabled={!!exportingType}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50/40 text-left transition cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-red-100 group-hover:text-red-600 transition shrink-0">
              <ImageIcon className="size-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">PNG Image</div>
              <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                High-resolution raster graphic for presentations &amp; docs
              </div>
            </div>
          </button>

          {/* Option 2: SVG */}
          <button
            type="button"
            onClick={handleExportSvg}
            disabled={!!exportingType}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50/40 text-left transition cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-red-100 group-hover:text-red-600 transition shrink-0">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">SVG Vector</div>
              <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                Infinitely scalable vector format for Figma, web, &amp; print
              </div>
            </div>
          </button>

          {/* Option 3: JSON Source */}
          <button
            type="button"
            onClick={handleExportJson}
            disabled={!!exportingType}
            className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50/40 text-left transition cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-red-100 group-hover:text-red-600 transition shrink-0">
              <FileCode className="size-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Source JSON</div>
              <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                Full diagram data backup, re-importable into Studio
              </div>
            </div>
          </button>

          {/* Option 4: SQL DDL */}
          {isDatabaseDiagram && (
            <button
              type="button"
              onClick={handleExportSql}
              disabled={!!exportingType}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50/40 text-left transition cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-red-100 group-hover:text-red-600 transition shrink-0">
                <FileText className="size-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900">SQL DDL Script</div>
                <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                  PostgreSQL / MySQL table &amp; foreign key definitions
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
