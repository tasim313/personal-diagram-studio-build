'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as go from 'gojs'
import {
  Database,
  Table,
  Link as LinkIcon,
  Trash2,
  X,
  Columns,
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
  const [selectedLinkInfo, setSelectedLinkInfo] = useState<{ from: string; to: string } | null>(null)
  const [availableTables, setAvailableTables] = useState<string[]>(['USERS', 'PROJECTS', 'DIAGRAMS'])
  const [availableLinks, setAvailableLinks] = useState<{ from: string; to: string; text?: string }[]>([
    { from: 'USERS', to: 'PROJECTS', text: '1 : N' },
    { from: 'PROJECTS', to: 'DIAGRAMS', text: '1 : N' },
  ])

  // Modals state
  const [isAddTableOpen, setIsAddTableOpen] = useState(false)
  const [newTableName, setNewTableName] = useState('')

  // Column / Field Manager Modal
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false)
  const [targetTableForColumns, setTargetTableForColumns] = useState('USERS')
  const [tableColumns, setTableColumns] = useState<{ name: string; iskey: boolean; color?: string }[]>([])
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldIsKey, setNewFieldIsKey] = useState(false)

  // Relationship Manager Modal
  const [isRelationshipManagerOpen, setIsRelationshipManagerOpen] = useState(false)
  const [linkFrom, setLinkFrom] = useState('')
  const [linkTo, setLinkTo] = useState('')
  const [linkType, setLinkType] = useState('1 : N')

  // Delete Table Modal
  const [isDeleteTableOpen, setIsDeleteTableOpen] = useState(false)
  const [tableToDelete, setTableToDelete] = useState('USERS')

  // Helper to extract clean state and notify parent
  const syncModelChange = () => {
    if (!myDiagramRef.current) return
    const model = myDiagramRef.current.model as go.GraphLinksModel
    const nodes = JSON.parse(JSON.stringify(model.nodeDataArray || [])) as go.ObjectData[]
    const links = JSON.parse(JSON.stringify(model.linkDataArray || [])) as go.ObjectData[]

    const tableKeys = nodes.map((n) => String(n.key || ''))
    setAvailableTables(tableKeys)

    const mappedLinks = links.map((l: { from?: string; to?: string; text?: string }) => ({
      from: String(l.from || ''),
      to: String(l.to || ''),
      text: String(l.text || ''),
    }))
    setAvailableLinks(mappedLinks)

    // Update active table columns
    const activeNode = nodes.find((n) => String(n.key) === targetTableForColumns)
    if (activeNode && Array.isArray(activeNode.items)) {
      setTableColumns(activeNode.items)
    }

    if (onChange) {
      onChange({
        nodeDataArray: nodes,
        linkDataArray: links,
      })
    }
  }

  // Load columns for a given table
  const refreshColumnsForTable = (tableKey: string) => {
    if (!myDiagramRef.current) return
    const node = myDiagramRef.current.findNodeForKey(tableKey)
    if (node && node.data && Array.isArray(node.data.items)) {
      setTableColumns([...node.data.items])
    } else {
      setTableColumns([])
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

    // Enable keyboard Delete & Backspace directly on canvas
    myDiagram.commandHandler.deleteSelection = function () {
      go.CommandHandler.prototype.deleteSelection.call(this)
      syncModelChange()
    }

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

    const mappedLinks = initialLinks.map((l: { from?: string; to?: string; text?: string }) => ({
      from: String(l.from || ''),
      to: String(l.to || ''),
      text: String(l.text || ''),
    }))
    setAvailableLinks(mappedLinks)

    if (tableKeys.length > 0) {
      setSelectedTableKey(tableKeys[0])
      setTargetTableForColumns(tableKeys[0])
      setTableToDelete(tableKeys[0])
      const first = initialNodes[0]
      if (first && Array.isArray(first.items)) {
        setTableColumns([...first.items])
      }
    }

    // Keep track of active selection on canvas
    myDiagram.addDiagramListener('ChangedSelection', () => {
      const sel = myDiagram.selection.first()
      if (sel instanceof go.Node && sel.data) {
        const k = String(sel.data.key || '')
        setSelectedTableKey(k)
        setSelectedLinkInfo(null)
        setTargetTableForColumns(k)
        setTableToDelete(k)
        if (Array.isArray(sel.data.items)) {
          setTableColumns([...sel.data.items])
        }
      } else if (sel instanceof go.Link && sel.data) {
        setSelectedLinkInfo({
          from: String(sel.data.from || ''),
          to: String(sel.data.to || ''),
        })
      } else {
        setSelectedLinkInfo(null)
      }
    })

    // Listen to changes
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

    const createdNode = myDiagram.findNodeForKey(finalName)
    if (createdNode) {
      myDiagram.select(createdNode)
    }

    setSelectedTableKey(finalName)
    setTargetTableForColumns(finalName)
    setTableToDelete(finalName)
    setNewTableName('')
    setIsAddTableOpen(false)
    syncModelChange()
  }

  // 2. ADD COLUMN / FIELD
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault()
    const field = newFieldName.trim()
    const targetKey = targetTableForColumns || selectedTableKey
    if (!field || !targetKey || !myDiagramRef.current) return

    const myDiagram = myDiagramRef.current
    const targetNode = myDiagram.findNodeForKey(targetKey)

    if (targetNode && targetNode.data) {
      myDiagram.startTransaction('add column')
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
      myDiagram.commitTransaction('add column')
      setTableColumns(updatedItems)
    }

    setNewFieldName('')
    setNewFieldIsKey(false)
    syncModelChange()
  }

  // 3. DELETE SPECIFIC COLUMN FROM TABLE
  const handleDeleteColumn = (colName: string) => {
    const targetKey = targetTableForColumns || selectedTableKey
    if (!targetKey || !myDiagramRef.current) return

    const myDiagram = myDiagramRef.current
    const targetNode = myDiagram.findNodeForKey(targetKey)

    if (targetNode && targetNode.data) {
      myDiagram.startTransaction('delete column')
      const existingItems = Array.isArray(targetNode.data.items) ? targetNode.data.items : []
      const updatedItems = existingItems.filter((col: { name: string }) => col.name !== colName)
      myDiagram.model.setDataProperty(targetNode.data, 'items', updatedItems)
      myDiagram.commitTransaction('delete column')
      setTableColumns(updatedItems)
    }

    syncModelChange()
  }

  // 4. ADD RELATIONSHIP BETWEEN TABLES
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

    setIsRelationshipManagerOpen(false)
    syncModelChange()
  }

  // 5. DELETE SPECIFIC RELATIONSHIP
  const handleDeleteLink = (from: string, to: string) => {
    if (!myDiagramRef.current) return
    const myDiagram = myDiagramRef.current
    const model = myDiagram.model as go.GraphLinksModel

    const links = model.linkDataArray as { from?: string; to?: string }[]
    const targetLink = links.find((l) => l.from === from && l.to === to)

    if (targetLink) {
      myDiagram.startTransaction('delete relationship')
      model.removeLinkData(targetLink)
      myDiagram.commitTransaction('delete relationship')
    }

    setSelectedLinkInfo(null)
    syncModelChange()
  }

  // 6. DELETE TABLE
  const handleDeleteTable = (keyToDelete?: string) => {
    if (!myDiagramRef.current) return
    const myDiagram = myDiagramRef.current
    const key = keyToDelete || tableToDelete || selectedTableKey

    const node = myDiagram.findNodeForKey(key)
    if (node) {
      myDiagram.startTransaction('delete table')
      myDiagram.remove(node)
      myDiagram.commitTransaction('delete table')
    }

    setIsDeleteTableOpen(false)
    syncModelChange()
  }

  // 7. DELETE WHATEVER IS CURRENTLY SELECTED
  const handleDeleteSelected = () => {
    if (!myDiagramRef.current) return
    const myDiagram = myDiagramRef.current

    if (myDiagram.selection.count > 0) {
      myDiagram.startTransaction('delete selection')
      myDiagram.commandHandler.deleteSelection()
      myDiagram.commitTransaction('delete selection')
    } else if (selectedLinkInfo) {
      handleDeleteLink(selectedLinkInfo.from, selectedLinkInfo.to)
    } else if (selectedTableKey) {
      handleDeleteTable(selectedTableKey)
    }

    syncModelChange()
  }

  return (
    <div className="h-full w-full bg-slate-50 relative overflow-hidden select-none">
      {/* ── ERD Toolbar ────────────────────────────────────────── */}
      <div className="absolute top-3 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-gray-200 shadow-md">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1 hidden sm:inline">
          {diagramType.toUpperCase()} TOOLS:
        </span>

        {/* Selected indicator */}
        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-xs font-semibold text-gray-700 mr-1">
          <Database className="size-3 text-red-600" />
          <span className="truncate max-w-28">
            {selectedLinkInfo
              ? `${selectedLinkInfo.from} → ${selectedLinkInfo.to}`
              : selectedTableKey || 'Select table'}
          </span>
        </div>

        {/* 1. Add Table */}
        <button
          type="button"
          onClick={() => setIsAddTableOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-blue-200"
          title="Add a new database entity / table"
        >
          <Table className="size-3.5" />
          <span>+ Add Table</span>
        </button>

        {/* 2. Columns & Fields Manager */}
        <button
          type="button"
          onClick={() => {
            const cur = selectedTableKey || availableTables[0] || 'USERS'
            setTargetTableForColumns(cur)
            refreshColumnsForTable(cur)
            setIsColumnManagerOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-emerald-200"
          title="Add or delete columns in a specific table"
        >
          <Columns className="size-3.5" />
          <span>Columns &amp; Fields</span>
        </button>

        {/* 3. Relationships Manager */}
        <button
          type="button"
          onClick={() => {
            if (availableTables.length >= 2) {
              setLinkFrom(availableTables[0])
              setLinkTo(availableTables[1])
            }
            setIsRelationshipManagerOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-purple-200"
          title="Manage & delete relationships between tables"
        >
          <LinkIcon className="size-3.5" />
          <span>Relationships ({availableLinks.length})</span>
        </button>

        {/* 4. Delete Table / Selected */}
        <button
          type="button"
          onClick={() => {
            if (myDiagramRef.current?.selection.count || selectedLinkInfo) {
              handleDeleteSelected()
            } else {
              setTableToDelete(selectedTableKey || availableTables[0] || '')
              setIsDeleteTableOpen(true)
            }
          }}
          className="flex items-center gap-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-red-200"
          title="Delete selected table, column, or link"
        >
          <Trash2 className="size-3.5" />
          <span>Delete</span>
        </button>
      </div>

      {/* ── MODAL 1: Add Table ─────────────────────────────────── */}
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
                Table Name (e.g. ORDERS, INVOICES, PRODUCTS)
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
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition cursor-pointer"
              >
                Create Table
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL 2: Column & Field Manager (Add & Delete specific columns) ─── */}
      {isColumnManagerOpen && (
        <div className="absolute top-16 left-12 z-30 w-96 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-2xl p-5 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-1.5">
              <Columns className="size-4 text-emerald-600" />
              <span className="text-sm font-bold text-gray-800">Manage Columns &amp; Fields</span>
            </div>
            <button
              onClick={() => setIsColumnManagerOpen(false)}
              className="text-gray-400 hover:text-gray-600 rounded p-1 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Target Table Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Select Table to Edit
              </label>
              <select
                value={targetTableForColumns}
                onChange={(e) => {
                  setTargetTableForColumns(e.target.value)
                  refreshColumnsForTable(e.target.value)
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:border-emerald-600 focus:outline-none"
              >
                {availableTables.map((t) => (
                  <option key={t} value={t}>
                    Table: {t}
                  </option>
                ))}
              </select>
            </div>

            {/* List of Current Columns with Delete button for each */}
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Current Columns in {targetTableForColumns} ({tableColumns.length}):
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 rounded-xl border border-gray-200 bg-gray-50/60 p-2">
                {tableColumns.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">No columns in this table</p>
                ) : (
                  tableColumns.map((col) => (
                    <div
                      key={col.name}
                      className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-2xs text-xs"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`size-2 rounded-full ${
                            col.iskey ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                        />
                        <span className="font-semibold text-gray-800 truncate">{col.name}</span>
                        {col.iskey && (
                          <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1 py-0.2 rounded">
                            PK
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteColumn(col.name)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition cursor-pointer"
                        title={`Delete column "${col.name}" from ${targetTableForColumns}`}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Form to Add New Column */}
            <form onSubmit={handleAddColumn} className="pt-2 border-t border-gray-100 space-y-2.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                + Add New Column to {targetTableForColumns}
              </span>

              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Column name (e.g. status, total)..."
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-emerald-600 focus:outline-none"
                />

                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition cursor-pointer shrink-0"
                >
                  + Add
                </button>
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
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Relationship Manager (Add & Delete specific relationships) ── */}
      {isRelationshipManagerOpen && (
        <div className="absolute top-16 left-36 z-30 w-96 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-2xl p-5 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-1.5">
              <LinkIcon className="size-4 text-purple-600" />
              <span className="text-sm font-bold text-gray-800">Manage Relationships</span>
            </div>
            <button
              onClick={() => setIsRelationshipManagerOpen(false)}
              className="text-gray-400 hover:text-gray-600 rounded p-1 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* List of Active Relationships with Delete button */}
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Existing Relationships ({availableLinks.length}):
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1.5 rounded-xl border border-gray-200 bg-gray-50/60 p-2">
                {availableLinks.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-2">No relationships connecting tables</p>
                ) : (
                  availableLinks.map((link, idx) => (
                    <div
                      key={`${link.from}-${link.to}-${idx}`}
                      className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-2xs text-xs"
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                        <span className="text-blue-600">{link.from}</span>
                        <span className="text-gray-400">──</span>
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                          {link.text || 'relates'}
                        </span>
                        <span className="text-gray-400">──&gt;</span>
                        <span className="text-emerald-600">{link.to}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteLink(link.from, link.to)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition cursor-pointer"
                        title={`Delete relationship between ${link.from} and ${link.to}`}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Form to Add New Relationship */}
            <form onSubmit={handleAddLink} className="pt-2 border-t border-gray-100 space-y-2.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                + Create New Relationship
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">From Table</label>
                  <select
                    value={linkFrom}
                    onChange={(e) => setLinkFrom(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900"
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
                    className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900"
                >
                  <option value="1 : N">One to Many (1 : N)</option>
                  <option value="1 : 1">One to One (1 : 1)</option>
                  <option value="N : M">Many to Many (N : M)</option>
                </select>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-purple-700 transition cursor-pointer"
                >
                  Connect Tables
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Delete Table Confirmation ─────────────────── */}
      {isDeleteTableOpen && (
        <div className="absolute top-16 left-60 z-30 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl p-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-1.5">
              <Trash2 className="size-3.5 text-red-600" />
              <span className="text-xs font-bold text-gray-800">Delete Entire Table</span>
            </div>
            <button
              onClick={() => setIsDeleteTableOpen(false)}
              className="text-gray-400 hover:text-gray-600 rounded p-1 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Select Table to Remove:
              </label>
              <select
                value={tableToDelete}
                onChange={(e) => setTableToDelete(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-900"
              >
                {availableTables.map((t) => (
                  <option key={t} value={t}>
                    Delete: {t}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[11px] text-red-600">
              This will remove the table and all its relationships from the ERD.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsDeleteTableOpen(false)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTable(tableToDelete)}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-red-700 transition cursor-pointer"
              >
                Delete Table
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
