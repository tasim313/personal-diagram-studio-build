'use client'

import React, { useEffect, useRef } from 'react'
import * as go from 'gojs'

interface GoJSEditorProps {
  initialData?: {
    nodeDataArray?: unknown[]
    linkDataArray?: unknown[]
  }
  diagramType?: string
  onChange?: (data: { nodeDataArray: unknown[]; linkDataArray: unknown[] }) => void
}

const defaultERDNodes = [
  {
    key: 'USERS',
    items: [
      { name: 'id', iskey: true, figure: 'Decision', color: '#ef4444' },
      { name: 'name', iskey: false, figure: 'Cube1', color: '#3b82f6' },
      { name: 'email', iskey: false, figure: 'Cube1', color: '#3b82f6' },
      { name: 'created_at', iskey: false, figure: 'Cube1', color: '#10b981' },
    ],
    loc: '0 0',
  },
  {
    key: 'PROJECTS',
    items: [
      { name: 'id', iskey: true, figure: 'Decision', color: '#ef4444' },
      { name: 'user_id', iskey: false, figure: 'Decision', color: '#f59e0b' },
      { name: 'name', iskey: false, figure: 'Cube1', color: '#3b82f6' },
      { name: 'updated_at', iskey: false, figure: 'Cube1', color: '#10b981' },
    ],
    loc: '260 0',
  },
  {
    key: 'DIAGRAMS',
    items: [
      { name: 'id', iskey: true, figure: 'Decision', color: '#ef4444' },
      { name: 'project_id', iskey: false, figure: 'Decision', color: '#f59e0b' },
      { name: 'engine', iskey: false, figure: 'Cube1', color: '#8b5cf6' },
      { name: 'data', iskey: false, figure: 'Cube1', color: '#64748b' },
    ],
    loc: '520 0',
  },
]

const defaultERDLinks = [
  { from: 'USERS', to: 'PROJECTS', text: '1 : N' },
  { from: 'PROJECTS', to: 'DIAGRAMS', text: '1 : N' },
]

export function GoJSEditor({ initialData, onChange }: GoJSEditorProps) {
  const diagramRef = useRef<HTMLDivElement>(null)
  const myDiagramRef = useRef<go.Diagram | null>(null)

  useEffect(() => {
    if (!diagramRef.current) return

    const $ = go.GraphObject.make

    const myDiagram = new go.Diagram(diagramRef.current, {
      'undoManager.isEnabled': true,
      'animationManager.isEnabled': false,
      model: new go.GraphLinksModel({
        linkKeyProperty: 'key',
      }),
    })

    // Item template for ERD attributes
    const itemTemplate = $(
      go.Panel,
      'Horizontal',
      $(
        go.Shape,
        { desiredSize: new go.Size(10, 10), margin: new go.Margin(0, 4, 0, 0) },
        new go.Binding('figure', 'figure'),
        new go.Binding('fill', 'color')
      ),
      $(
        go.TextBlock,
        { font: '11px sans-serif', stroke: '#334155' },
        new go.Binding('text', 'name'),
        new go.Binding('font', 'iskey', (k) => (k ? 'bold 11px sans-serif' : '11px sans-serif'))
      )
    )

    // Node template
    myDiagram.nodeTemplate = $(
      go.Node,
      'Auto',
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Shape, 'RoundedRectangle', {
        fill: '#ffffff',
        stroke: '#cbd5e1',
        strokeWidth: 1.5,
        portId: '',
        cursor: 'pointer',
        fromLinkable: true,
        toLinkable: true,
      }),
      $(
        go.Panel,
        'Table',
        { margin: 8, minSize: new go.Size(130, NaN) },
        // Header
        $(
          go.TextBlock,
          {
            row: 0,
            column: 0,
            columnSpan: 2,
            alignment: go.Spot.Center,
            font: 'bold 13px sans-serif',
            stroke: '#0f172a',
            margin: new go.Margin(0, 0, 8, 0),
          },
          new go.Binding('text', 'key')
        ),
        // Attributes list
        $(
          go.Panel,
          'Vertical',
          {
            row: 1,
            column: 0,
            columnSpan: 2,
            alignment: go.Spot.TopLeft,
            defaultAlignment: go.Spot.Left,
            itemTemplate: itemTemplate,
          },
          new go.Binding('itemArray', 'items')
        )
      )
    )

    // Link template
    myDiagram.linkTemplate = $(
      go.Link,
      { routing: go.Routing.AvoidsNodes, corner: 6 },
      $(go.Shape, { stroke: '#64748b', strokeWidth: 1.5 }),
      $(go.Shape, { toArrow: 'Standard', stroke: '#64748b', fill: '#64748b' }),
      $(
        go.TextBlock,
        {
          segmentOffset: new go.Point(0, -10),
          font: '10px sans-serif',
          stroke: '#64748b',
          background: '#ffffff',
        },
        new go.Binding('text', 'text')
      )
    )

    // Populate model
    const nodes = (initialData?.nodeDataArray?.length ? initialData.nodeDataArray : defaultERDNodes) as go.ObjectData[]
    const links = (initialData?.linkDataArray?.length ? initialData.linkDataArray : defaultERDLinks) as go.ObjectData[]

    myDiagram.model = new go.GraphLinksModel(nodes, links)

    // Listener for changes
    myDiagram.addModelChangedListener((e) => {
      if (e.isTransactionFinished && onChange) {
        const modelJson = myDiagram.model.toIncrementalJson(e)
        if (modelJson) {
          onChange({
            nodeDataArray: (myDiagram.model as go.GraphLinksModel).nodeDataArray,
            linkDataArray: (myDiagram.model as go.GraphLinksModel).linkDataArray,
          })
        }
      }
    })

    myDiagramRef.current = myDiagram

    return () => {
      myDiagram.div = null
    }
  }, [initialData, onChange])

  return (
    <div className="h-full w-full bg-slate-50 relative">
      <div ref={diagramRef} className="w-full h-full" />
    </div>
  )
}
