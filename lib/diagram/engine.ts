import type { DiagramEngineAdapter, DiagramEngineType, EngineCapabilities } from './types'
import { ENGINE_CAPABILITIES } from './types'

/**
 * Base Abstract Diagram Engine Adapter
 */
export abstract class BaseDiagramEngineAdapter implements DiagramEngineAdapter {
  abstract readonly engineType: DiagramEngineType
  protected data: unknown = null

  load(data: unknown): void {
    this.data = data
  }

  save(): unknown {
    return this.data
  }

  async exportJSON(): Promise<Blob> {
    const jsonString = JSON.stringify(this.save(), null, 2)
    return new Blob([jsonString], { type: 'application/json' })
  }

  abstract exportPNG?(): Promise<Blob>
  abstract exportSVG?(): Promise<Blob>
}

/**
 * Excalidraw Engine Adapter
 */
export class ExcalidrawEngineAdapter extends BaseDiagramEngineAdapter {
  readonly engineType = 'excalidraw' as const

  async exportExcalidraw(): Promise<Blob> {
    const raw = this.save() || {}
    const excalidrawFile = {
      type: 'excalidraw',
      version: 2,
      source: 'https://personal-diagram-studio.com',
      elements: (raw as { elements?: unknown[] }).elements || [],
      appState: {
        gridSize: null,
        viewBackgroundColor: '#ffffff',
      },
      files: (raw as { files?: Record<string, unknown> }).files || {},
    }
    return new Blob([JSON.stringify(excalidrawFile, null, 2)], {
      type: 'application/vnd.excalidraw+json',
    })
  }

  async exportPNG(): Promise<Blob> {
    // In Phase 2D/2E this delegates to @excalidraw/excalidraw exportToBlob
    return new Blob(['Excalidraw PNG Render'], { type: 'image/png' })
  }

  async exportSVG(): Promise<Blob> {
    return new Blob(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], { type: 'image/svg+xml' })
  }
}

/**
 * React Flow Engine Adapter
 */
export class ReactFlowEngineAdapter extends BaseDiagramEngineAdapter {
  readonly engineType = 'reactflow' as const

  async exportPNG(): Promise<Blob> {
    return new Blob(['React Flow PNG Render'], { type: 'image/png' })
  }

  async exportSVG(): Promise<Blob> {
    return new Blob(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], { type: 'image/svg+xml' })
  }
}

/**
 * GoJS Engine Adapter
 */
export class GoJSEngineAdapter extends BaseDiagramEngineAdapter {
  readonly engineType = 'gojs' as const

  async exportPNG(): Promise<Blob> {
    return new Blob(['GoJS PNG Render'], { type: 'image/png' })
  }

  async exportSVG(): Promise<Blob> {
    return new Blob(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], { type: 'image/svg+xml' })
  }
}

/**
 * Adapter Registry Factory
 */
export function getEngineAdapter(engineType: DiagramEngineType): DiagramEngineAdapter {
  switch (engineType) {
    case 'excalidraw':
      return new ExcalidrawEngineAdapter()
    case 'reactflow':
      return new ReactFlowEngineAdapter()
    case 'gojs':
      return new GoJSEngineAdapter()
    default:
      throw new Error(`Unsupported engine type: ${engineType}`)
  }
}

export function getEngineCapabilities(engineType: DiagramEngineType): EngineCapabilities {
  return ENGINE_CAPABILITIES[engineType]
}
