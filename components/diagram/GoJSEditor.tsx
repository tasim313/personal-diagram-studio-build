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
    loc: '50 50',
  },
  {
    key: 'PROJECTS',
    items: [
      { name: 'id', iskey: true, figure: 'Decision', color: '#ef4444' },
      { name: 'user_id', iskey: false, figure: 'Decision', color: '#f59e0b' },
      { name: 'name', iskey: false, figure: 'Cube1', color: '#3b82f6' },
      { name: 'updated_at', iskey: false, figure: 'Cube1', color: '#10b981' },
    ],
    loc: '320 50',
  },
  {
    key: 'DIAGRAMS',
    items: [
      { name: 'id', iskey: true, figure: 'Decision', color: '#ef4444' },
      { name: 'project_id', iskey: false, figure: 'Decision', color: '#f59e0b' },
      { name: 'engine', iskey: false, figure: 'Cube1', color: '#8b5cf6' },
      { name: 'data', iskey: false, figure: 'Cube1', color: '#64748b' },
    ],
    loc: '590 50',
  },
]

const defaultERDLinks = [
  { from: 'USERS', to: 'PROJECTS', text: '1 : N' },
  { from: 'PROJECTS', to: 'DIAGRAMS', text: '1 : N' },
]

export function GoJSEditor({ initialData, diagramType = 'erd', onChange }: GoJSEditorProps) {
  const diagramRef = useRef<HTMLDivElement>(null)
  const myDiagramRef = useRef<go.Diagram | null>(null)

  // Selection tracking
  const [selectedTableKey, setSelectedTableKey] = useState<string>('USERS')
  const [availableTables, setAvailableTables] = useState<string[]>(['USERS', 'PROJECTS', 'DIAGRAMS'])

  // Modals state
  const [isAddTableOpen, setIsAddTableOpen] = useState(false)
  const [newTableName, setNewTableName] = useState('')

  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false)
  const [targetTableForField, setTargetTableForField] = useState('USERS')
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldIsKey, setNewFieldIsKey] = useState(false)

  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false)
  const [linkFrom, setLinkFrom] = useState('')
  const [linkTo, setLinkTo] = useState('')
  const [linkType, setLinkType] = useState('1 : N')

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState('USERS')

  // Helper to extract clean state and notify parent
  const syncModelChange = () => {
    if (!myDiagramRef.current) return
    const model = myDiagramRef.current.model as go.GraphLinksModel
    const nodes = JSON.parse(JSON.stringify(model.nodeDataArray || [])) as go.ObjectData[]
    const links = JSON.parse(JSON.stringify(model.linkDataArray || [])) as go.ObjectData[]

    const tableKeys = nodes.map((n) => String(n.key || ''))
    setAvailableTables(tableKeys)

    if (onChange) {
      onChange({
        nodeDataArray: nodes,
        linkDataArray: links,
      })
    }
  }

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

    // Item template for attributes
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
        strokeWidth: 2,
        portId: '',
        cursor: 'pointer',
        fromLinkable: true,
        toLinkable: true,
      }),
      $(
        go.Panel,
        'Table',
        { margin: 10, minSize: new go.Size(140, NaN) },
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
          font: 'bold 10px sans-serif',
          stroke: '#475569',
          background: '#ffffff',
        },
        new go.Binding('text', 'text')
      )
    )

    // Populate model
    const initialNodes = (
      initialData?.nodeDataArray && initialData.nodeDataArray.length > 0
        ? initialData.nodeDataArray
        : defaultERDNodes
    ) as go.ObjectData[]

    const initialLinks = (
      initialData?.linkDataArray && initialData.linkDataArray.length > 0
        ? initialData.linkDataArray
        : defaultERDLinks
    ) as go.ObjectData[]

    myDiagram.model = new go.GraphLinksModel(initialNodes, initialLinks)

    const tableKeys = initialNodes.map((n) => String(n.key || ''))
    setAvailableTables(tableKeys)
    if (tableKeys.length > 0) {
      setSelectedTableKey(tableKeys[0])
      setTargetTableForField(tableKeys[0])
      setTableToDelete(tableKeys[0])
    }

    // Keep track of active selection on canvas
    myDiagram.addDiagramListener('ChangedSelection', () => {
      const sel = myDiagram.selection.first()
      if (sel instanceof go.Node && sel.data) {
        const k = String(sel.data.key || '')
        setSelectedTableKey(k)
        setTargetTableForField(k)
        setTableToDelete(k)
      }
    })

    // Listen to changes (e.g. dragging or manual edits)
    myDiagram.addModelChangedListener((e) => {
      if (e.isTransactionFinished) {
        syncModelChange()
      }
    })

    myDiagramRef.current = myDiagram

    return () => {
      myDiagram.div = null
    }
  }, [initialData])

  // 1. ADD NEW TABLE / ENTITY
  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newTableName.trim().toUpperCase()
    if (!name || !myDiagramRef.current) return

    const myDiagram = myDiagramRef.current
    const model = myDiagram.model as go.GraphLinksModel

    // Ensure unique name
    let finalName = name
    let counter = 1
    while (model.findNodeDataForKey(finalName)) {
      finalName = `${name}_${counter++}`
    }

    myDiagram.startTransaction('add table')
    const newNode = {
      key: finalName,
      items: [
        { name: 'id', iskey: true, figure: 'Decision', color: '#ef4444' },
        { name: 'name', iskey: false, figure: 'Cube1', color: '#3b82f6' },
        { name: 'created_at', iskey: false, figure: 'Cube1', color: '#10b981' },
      ],
      loc: `${Math.floor(Math.random() * 300 + 100)} ${Math.floor(Math.random() * 200 + 50)}`,
    }
    model.addNodeData(newNode)
    myDiagram.commitTransaction('add table')

    // Select the new node
    const createdNode = myDiagram.findNodeForKey(finalName)
    if (createdNode) {
      myDiagram.select(createdNode)
    }

    setSelectedTableKey(finalName)
    setTargetTableForField(finalName)
    setNewTableName('')
    setIsAddTableOpen(false)
    syncModelChange()
  }

  // 2. ADD COLUMN / FIELD TO SPECIFIC TABLE
  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault()
    const field = newFieldName.trim()
    const targetKey = targetTableForField || selectedTableKey
    if (!field || !targetKey || !myDiagramRef.current) return

    const myDiagram = myDiagramRef.current
    const targetNode = myDiagram.findNodeForKey(targetKey)

    if (targetNode && targetNode.data) {
      myDiagram.startTransaction('add field')
      const existingItems = Array.isArray(targetNode.data.items) ? targetNode.data.items : []
      const updatedItems = [
        ...existingItems,
        {
          name: field,
          iskey: newFieldIsKey,
          figure: newFieldIsKey ? 'Decision' : 'Cube1',
          color: newFieldIsKey ? '#ef4444' : '#3b82f6',
        },
      ]
      myDiagram.model.setDataProperty(targetNode.data, 'items', updatedItems)
      myDiagram.commitTransaction('add field')
    }

    setNewFieldName('')
    setNewFieldIsKey(false)
    setIsAddFieldOpen(false)
    syncModelChange()
  }

  // 3. ADD RELATIONSHIP BETWEEN TABLES
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkFrom || !linkTo || !myDiagramRef.current) return

    const myDiagram = myDiagramRef.current
    myDiagram.startTransaction('add relationship')
    const model = myDiagram.model as go.GraphLinksModel

    model.addLinkData({
      from: linkFrom,
      to: linkTo,
      text: linkType,
    })
    myDiagram.commitTransaction('add relationship')

    setIsAddLinkOpen(false)
    syncModelChange()
  }

  // 4. DELETE TABLE / SELECTION
  const handleConfirmDelete = () => {
    if (!myDiagramRef.current) return
    const myDiagram = myDiagramRef.current

    myDiagram.startTransaction('delete table')

    // Try deleting canvas selection first
    if (myDiagram.selection.count > 0) {
      myDiagram.commandHandler.deleteSelection()
    } else {
      // Fallback: delete chosen table by key
      const key = tableToDelete || selectedTableKey
      const node = myDiagram.findNodeForKey(key)
      if (node) {
        myDiagram.remove(node)
      }
    }

    myDiagram.commitTransaction('delete table')
    setIsDeleteOpen(false)
    syncModelChange()
  }

  return (
    <div className="h-full w-full bg-slate-50 relative overflow-hidden select-none">
      {/* ── ERD Toolbar ────────────────────────────────────────── */}
      <div className="absolute top-3 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-gray-200 shadow-md">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1 hidden sm:inline">
          {diagramType.toUpperCase()} TOOLS:
        </span>

        {/* Selected table indicator */}
        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-xs font-semibold text-gray-700 mr-1">
          <Database className="size-3 text-red-600" />
          <span className="truncate max-w-28">{selectedTableKey || 'None'}</span>
        </div>

        {/* Add Entity Table */}
        <button
          type="button"
          onClick={() => setIsAddTableOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-blue-200"
          title="Add a new database entity / table"
        >
          <Table className="size-3.5" />
          <span>+ Add Entity / Table</span>
        </button>

        {/* Add Column */}
        <button
          type="button"
          onClick={() => {
            setTargetTableForField(selectedTableKey || availableTables[0] || '')
            setIsAddFieldOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-emerald-200"
          title="Add a column / attribute to table"
        >
          <Plus className="size-3.5" />
          <span>+ Add Column</span>
        </button>

        {/* Add Relationship */}
        <button
          type="button"
          onClick={() => {
            if (availableTables.length >= 2) {
              setLinkFrom(availableTables[0])
              setLinkTo(availableTables[1])
            } else if (availableTables.length === 1) {
              setLinkFrom(availableTables[0])
              setLinkTo(availableTables[0])
            }
            setIsAddLinkOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-purple-200"
          title="Connect tables with 1:N, 1:1, or N:M"
        >
          <LinkIcon className="size-3.5" />
          <span>+ Add Relationship</span>
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => {
            setTableToDelete(selectedTableKey || availableTables[0] || '')
            setIsDeleteOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-red-200"
          title="Delete table or relationship"
        >
          <Trash2 className="size-3.5" />
          <span>Delete</span>
        </button>
      </div>

      {/* ── Modal: Add Table ───────────────────────────────────── */}
      {isAddTableOpen && (
        <div className="absolute top-16 left-4 z-30 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl p-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-1.5">
              <Table className="size-3.5 text-blue-600" />
              <span className="text-xs font-bold text-gray-800">Add New Entity / Table</span>
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
                Entity / Table Name
              </label>
              <input
                type="text"
                autoFocus
                required
                placeholder="ORDERS, INVOICES, PRODUCTS..."
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-red-600 focus:outline-none uppercase"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Will be created with default `id (PK)` and `name` attributes.
              </span>
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

      {/* ── Modal: Add Column / Field ──────────────────────────── */}
      {isAddFieldOpen && (
        <div className="absolute top-16 left-28 z-30 w-84 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl p-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-1.5">
              <Plus className="size-3.5 text-emerald-600" />
              <span className="text-xs font-bold text-gray-800">Add Column to Table</span>
            </div>
            <button
              onClick={() => setIsAddFieldOpen(false)}
              className="text-gray-400 hover:text-gray-600 rounded p-1 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <form onSubmit={handleAddField} className="space-y-3">
            {/* Target Table Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Target Table
              </label>
              <select
                value={targetTableForField}
                onChange={(e) => setTargetTableForField(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-red-600 focus:outline-none"
              >
                {availableTables.map((t) => (
                  <option key={t} value={t}>
                    Table: {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Column Name */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Column Name (e.g. status, amount, user_id)
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
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition cursor-pointer"
              >
                Add Column
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal: Add Relationship ────────────────────────────── */}
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
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Cardinality / Label</label>
              <select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900"
              >
                <option value="1 : N">One to Many (1 : N)</option>
                <option value="1 : 1">One to One (1 : 1)</option>
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
                className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-purple-700 transition cursor-pointer"
              >
                Connect Tables
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal: Delete Confirmation ─────────────────────────── */}
      {isDeleteOpen && (
        <div className="absolute top-16 left-80 z-30 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl p-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-1.5">
              <Trash2 className="size-3.5 text-red-600" />
              <span className="text-xs font-bold text-gray-800">Delete Entity or Link</span>
            </div>
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="text-gray-400 hover:text-gray-600 rounded p-1 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Select which table or element you want to delete:
            </p>

            <div>
              <select
                value={tableToDelete}
                onChange={(e) => setTableToDelete(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900"
              >
                {availableTables.map((t) => (
                  <option key={t} value={t}>
                    Delete Table: {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-red-700 transition cursor-pointer"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GoJS Canvas ────────────────────────────────────────── */}
      <div ref={diagramRef} className="w-full h-full" />
    </div>
  )
}
