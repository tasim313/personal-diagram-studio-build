'use client'

import { useRef } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import '@excalidraw/excalidraw/index.css'

type ExcalidrawEditorProps = {
  initialData?: { elements: readonly ExcalidrawElement[]; appState?: Partial<AppState> }
  onChange: (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => void
}

export function ExcalidrawEditor({ initialData, onChange }: ExcalidrawEditorProps) {
  // Capture initialData on mount so subsequent renders never re-feed new references to Excalidraw
  const initialDataRef = useRef(initialData)

  return (
    <div className="h-full w-full">
      <Excalidraw
        initialData={initialDataRef.current}
        zenModeEnabled={false}
        viewModeEnabled={false}
        onChange={onChange}
      />
    </div>
  )
}
