'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as go from 'gojs'
import {
  Plus,
  Database,
  Table,
  Link as LinkIcon,
  Trash2,
  X,
} from 'lucide-react'

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

export function GoJSEditor({ initialData, diagramType = 'erd', onChange }: GoJSEditorProps) {
  const diagramRef = useRef<HTMLDivElement>(null)
  const myDiagramRef = useRef<go.Diagram | null>(null)

  // Modals / forms for adding entities & fields
  const [isAddTableOpen, setIsAddTableOpen] = useState(false)
  const [newTableName, setNewTableName] = useState('')
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false)
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldIsKey, setNewFieldIsKey] = useState(false)
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false)
  const [linkFrom, setLinkFrom] = useState('')
  const [linkTo, setLinkTo] = useState('')
  const [linkType, setLinkType] = useState('1 : N')

  const [availableTables, setAvailableTables] = useState<string[]>([])

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

    // Update list of table names
    setAvailableTables(nodes.map((n) => String(n.key || '')))

    // Listener for changes
    myDiagram.addModelChangedListener((e) => {
      if (e.isTransactionFinished && onChange) {
        const modelJson = myDiagram.model.toIncrementalJson(e)
        if (modelJson) {
          const updatedNodes = (myDiagram.model as go.GraphLinksModel).nodeDataArray as go.ObjectData[]
          const updatedLinks = (myDiagram.model as go.GraphLinksModel).linkDataArray as go.ObjectData[]
          onChange({
            nodeDataArray: updatedNodes,
            linkDataArray: updatedLinks,
          })
          setAvailableTables(updatedNodes.map((n) => String(n.key || '')))
        }
      }
    })

    myDiagramRef.current = myDiagram

    return () => {
      myDiagram.div = null
    }
  }, [initialData, onChange])

  // Handlers for adding new entities and relations
  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newTableName.trim().toUpperCase()
    if (!name || !myDiagramRef.current) return

    const myDiagram = myDiagramRef.current
    myDiagram.startTransaction('add table')
    const newNode = {
      key: name,
      items: [
        { name: 'id', iskey: true, figure: 'Decision', color: '#ef4444' },
        { name: 'name', iskey: false, figure: 'Cube1', color: '#3b82f6' },
        { name: 'created_at', iskey: false, figure: 'Cube1', color: '#10b981' },
      ],
      loc: `${Math.floor(Math.random() * 400 + 100)} ${Math.floor(Math.random() * 250 + 50)}`,
    }
    ;(myDiagram.model as go.GraphLinksModel).addNodeData(newNode)
    myDiagram.commitTransaction('add table')

    setNewTableName('')
    setIsAddTableOpen(false)
  }

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault()
    const field = newFieldName.trim()
    if (!field || !myDiagramRef.current) return

    const myDiagram = myDiagramRef.current
    const sel = myDiagram.selection.first()
    let targetNode = sel instanceof go.Node ? sel.data : null

    // If no node selected, use first table
    if (!targetNode) {
      const allNodes = (myDiagram.model as go.GraphLinksModel).nodeDataArray
      if (allNodes.length > 0) targetNode = allNodes[0]
    }

    if (targetNode) {
      myDiagram.startTransaction('add field')
      const items = Array.isArray(targetNode.items) ? [...targetNode.items] : []
      items.push({
        name: field,
        iskey: newFieldIsKey,
        figure: newFieldIsKey ? 'Decision' : 'Cube1',
        color: newFieldIsKey ? '#ef4444' : '#3b82f6',
      })
      myDiagram.model.setDataProperty(targetNode, 'items', items)
      myDiagram.commitTransaction('add field')
    }

    setNewFieldName('')
    setNewFieldIsKey(false)
    setIsAddFieldOpen(false)
  }

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkFrom || !linkTo || !myDiagramRef.current) return

    const myDiagram = myDiagramRef.current
    myDiagram.startTransaction('add link')
    ;(myDiagram.model as go.GraphLinksModel).addLinkData({
      from: linkFrom,
      to: linkTo,
      text: linkType,
    })
    myDiagram.commitTransaction('add link')

    setIsAddLinkOpen(false)
  }

  const handleDeleteSelected = () => {
    if (!myDiagramRef.current) return
    myDiagramRef.current.commandHandler.deleteSelection()
  }

  return (
    <div className="h-full w-full bg-slate-50 relative overflow-hidden select-none">
      {/* ── ERD Toolbar ────────────────────────────────────────── */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-gray-200 shadow-md">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1 hidden sm:inline">
          {diagramType.toUpperCase()} TOOLS:
        </span>

        <button
          type="button"
          onClick={() => setIsAddTableOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-blue-200"
          title="Add a new database entity / table"
        >
          <Table className="size-3.5" />
          <span>+ Add Entity / Table</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAddFieldOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-emerald-200"
          title="Add a column / field to selected table"
        >
          <Plus className="size-3.5" />
          <span>+ Add Column / Field</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (availableTables.length >= 2) {
              setLinkFrom(availableTables[0])
              setLinkTo(availableTables[1])
            }
            setIsAddLinkOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-purple-200"
          title="Add a relationship between tables"
        >
          <LinkIcon className="size-3.5" />
          <span>+ Add Relationship</span>
        </button>

        <button
          type="button"
          onClick={handleDeleteSelected}
          className="flex items-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-red-200"
          title="Delete selected table or link"
        >
          <Trash2 className="size-3.5" />
          <span className="hidden md:inline">Delete</span>
        </button>
      </div>

      {/* ── Add Table Modal ────────────────────────────────────── */}
      {isAddTableOpen && (
        <div className="absolute top-16 left-4 z-30 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl p-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-1.5">
              <Database className="size-3.5 text-blue-600" />
              <span className="text-xs font-bold text-gray-800">Add New Database Entity</span>
            </div>
            <button
              onClick={() => setIsAddTableOpen(false)}
              className="text-gray-400 hover:text-gray-600 rounded p-1 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <form onSubmit={handleAddTable} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Table / Entity Name (e.g. ORDERS, PRODUCTS, INVOICES)
              </label>
              <input
                type="text"
                autoFocus
                required
                placeholder="ORDERS"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-red-600 focus:outline-none uppercase"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddTableOpen(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-red-700 transition cursor-pointer"
              >
                Create Table
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Add Field Modal ────────────────────────────────────── */}
      {isAddFieldOpen && (
        <div className="absolute top-16 left-32 z-30 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl p-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-1.5">
              <Plus className="size-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-gray-800">Add Column / Attribute</span>
            </div>
            <button
              onClick={() => setIsAddFieldOpen(false)}
              className="text-gray-400 hover:text-gray-600 rounded p-1 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <form onSubmit={handleAddField} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Column Name (e.g. status, total_amount, email)
              </label>
              <input
                type="text"
                autoFocus
                required
                placeholder="status"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
              <input
                type="checkbox"
                checked={newFieldIsKey}
                onChange={(e) => setNewFieldIsKey(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span>Primary Key (PK)</span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddFieldOpen(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-red-700 transition cursor-pointer"
              >
                Add Column
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Add Relationship Modal ─────────────────────────────── */}
      {isAddLinkOpen && (
        <div className="absolute top-16 left-60 z-30 w-84 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl p-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-1.5">
              <LinkIcon className="size-3.5 text-purple-600" />
              <span className="text-xs font-bold text-gray-800">Add Table Relationship</span>
            </div>
            <button
              onClick={() => setIsAddLinkOpen(false)}
              className="text-gray-400 hover:text-gray-600 rounded p-1 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <form onSubmit={handleAddLink} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">From Table</label>
                <select
                  value={linkFrom}
                  onChange={(e) => setLinkFrom(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900"
                >
                  {availableTables.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">To Table</label>
                <select
                  value={linkTo}
                  onChange={(e) => setLinkTo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900"
                >
                  {availableTables.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Cardinality</label>
              <select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900"
              >
                <option value="1 : N">1 to Many (1 : N)</option>
                <option value="1 : 1">1 to 1 (1 : 1)</option>
                <option value="N : M">Many to Many (N : M)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddLinkOpen(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-red-700 transition cursor-pointer"
              >
                Connect Tables
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── GoJS Canvas ────────────────────────────────────────── */}
      <div ref={diagramRef} className="w-full h-full" />
    </div>
  )
}
