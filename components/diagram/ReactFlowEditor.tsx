'use client'

import React, { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  Plus,
  GitBranch,
  PlayCircle,
  CheckCircle,
  Database,
  Trash2,
  Edit2,
  X,
} from 'lucide-react'

interface ReactFlowEditorProps {
  initialData?: {
    nodes?: Node[]
    edges?: Edge[]
  }
  diagramType?: string
  onChange?: (data: { nodes: Node[]; edges: Edge[] }) => void
}

const defaultInitialNodes: Node[] = [
  {
    id: 'start-1',
    type: 'input',
    data: { label: 'Start / Entry Point' },
    position: { x: 300, y: 40 },
    style: {
      background: '#f0fdf4',
      border: '2px solid #22c55e',
      borderRadius: '24px',
      padding: '10px 22px',
      fontWeight: 600,
      color: '#15803d',
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
    },
  },
  {
    id: 'process-1',
    data: { label: 'Process Service Request' },
    position: { x: 300, y: 150 },
    style: {
      background: '#ffffff',
      border: '2px solid #3b82f6',
      borderRadius: '10px',
      padding: '12px 20px',
      fontWeight: 500,
      color: '#1e293b',
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
    },
  },
  {
    id: 'decision-1',
    data: { label: 'Validation Check' },
    position: { x: 300, y: 260 },
    style: {
      background: '#fffbeb',
      border: '2px solid #f59e0b',
      borderRadius: '8px',
      padding: '12px 20px',
      fontWeight: 600,
      color: '#b45309',
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
    },
  },
  {
    id: 'end-success',
    type: 'output',
    data: { label: 'Complete (Success)' },
    position: { x: 180, y: 380 },
    style: {
      background: '#ecfdf5',
      border: '2px solid #10b981',
      borderRadius: '24px',
      padding: '10px 22px',
      fontWeight: 600,
      color: '#047857',
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
    },
  },
  {
    id: 'end-error',
    type: 'output',
    data: { label: 'Error Fallback' },
    position: { x: 420, y: 380 },
    style: {
      background: '#fef2f2',
      border: '2px solid #ef4444',
      borderRadius: '24px',
      padding: '10px 22px',
      fontWeight: 600,
      color: '#b91c1c',
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
    },
  },
]

const defaultInitialEdges: Edge[] = [
  { id: 'e1-2', source: 'start-1', target: 'process-1', animated: true },
  { id: 'e2-3', source: 'process-1', target: 'decision-1' },
  { id: 'e3-4', source: 'decision-1', target: 'end-success', label: 'Valid' },
  { id: 'e3-5', source: 'decision-1', target: 'end-error', label: 'Invalid' },
]

export function ReactFlowEditor({ initialData, diagramType = 'flowchart', onChange }: ReactFlowEditorProps) {
  const initNodes = useMemo(() => {
    if (initialData?.nodes && initialData.nodes.length > 0) {
      return initialData.nodes
    }
    return defaultInitialNodes
  }, [initialData])

  const initEdges = useMemo(() => {
    if (initialData?.edges && initialData.edges.length > 0) {
      return initialData.edges
    }
    return defaultInitialEdges
  }, [initialData])

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)

  // Selected node for inline editing
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [editingLabel, setEditingLabel] = useState('')

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const next = addEdge(params, eds)
        if (onChange) onChange({ nodes, edges: next })
        return next
      })
    },
    [nodes, onChange, setEdges]
  )

  const handleNodeDragStop = useCallback(() => {
    if (onChange) {
      onChange({ nodes, edges })
    }
  }, [edges, nodes, onChange])

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setEditingLabel(String(node.data?.label || ''))
  }

  const handleUpdateLabel = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedNode) return

    const updated = nodes.map((n) => {
      if (n.id === selectedNode.id) {
        return {
          ...n,
          data: {
            ...n.data,
            label: editingLabel,
          },
        }
      }
      return n
    })

    setNodes(updated)
    setSelectedNode(null)
    if (onChange) onChange({ nodes: updated, edges })
  }

  const handleDeleteSelected = () => {
    if (!selectedNode) return
    const nextNodes = nodes.filter((n) => n.id !== selectedNode.id)
    const nextEdges = edges.filter(
      (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
    )
    setNodes(nextNodes)
    setEdges(nextEdges)
    setSelectedNode(null)
    if (onChange) onChange({ nodes: nextNodes, edges: nextEdges })
  }

  // Quick Add Node Helpers
  const addNode = (nodeType: 'process' | 'decision' | 'start' | 'end' | 'database') => {
    const id = `node-${Date.now()}`
    const xPos = 200 + Math.floor(Math.random() * 160)
    const yPos = 100 + Math.floor(Math.random() * 200)

    let newNode: Node

    switch (nodeType) {
      case 'start':
        newNode = {
          id,
          type: 'input',
          data: { label: 'Start / Trigger' },
          position: { x: xPos, y: yPos },
          style: {
            background: '#f0fdf4',
            border: '2px solid #22c55e',
            borderRadius: '24px',
            padding: '10px 22px',
            fontWeight: 600,
            color: '#15803d',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          },
        }
        break
      case 'decision':
        newNode = {
          id,
          data: { label: 'Condition / Decision' },
          position: { x: xPos, y: yPos },
          style: {
            background: '#fffbeb',
            border: '2px solid #f59e0b',
            borderRadius: '8px',
            padding: '12px 20px',
            fontWeight: 600,
            color: '#b45309',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          },
        }
        break
      case 'end':
        newNode = {
          id,
          type: 'output',
          data: { label: 'Finish / End' },
          position: { x: xPos, y: yPos },
          style: {
            background: '#ecfdf5',
            border: '2px solid #10b981',
            borderRadius: '24px',
            padding: '10px 22px',
            fontWeight: 600,
            color: '#047857',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          },
        }
        break
      case 'database':
        newNode = {
          id,
          data: { label: 'Database Storage' },
          position: { x: xPos, y: yPos },
          style: {
            background: '#f0f9ff',
            border: '2px solid #0284c7',
            borderRadius: '8px',
            padding: '12px 20px',
            fontWeight: 600,
            color: '#0369a1',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          },
        }
        break
      case 'process':
      default:
        newNode = {
          id,
          data: { label: 'New Process Step' },
          position: { x: xPos, y: yPos },
          style: {
            background: '#ffffff',
            border: '2px solid #3b82f6',
            borderRadius: '10px',
            padding: '12px 20px',
            fontWeight: 500,
            color: '#1e293b',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          },
        }
        break
    }

    const updated = [...nodes, newNode]
    setNodes(updated)
    if (onChange) onChange({ nodes: updated, edges })
  }

  return (
    <div className="h-full w-full bg-slate-50 relative overflow-hidden select-none">
      {/* ── Flowchart Node Toolbar ─────────────────────────────── */}
      <div className="absolute top-3 left-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-gray-200 shadow-md">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1 hidden sm:inline">
          {diagramType.toUpperCase()} TOOLS:
        </span>

        <button
          type="button"
          onClick={() => addNode('process')}
          className="flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-blue-200"
          title="Add a rectangular process step"
        >
          <Plus className="size-3.5" />
          <span>+ Step / Process</span>
        </button>

        <button
          type="button"
          onClick={() => addNode('decision')}
          className="flex items-center gap-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-amber-200"
          title="Add a decision diamond"
        >
          <GitBranch className="size-3.5" />
          <span>+ Decision</span>
        </button>

        <button
          type="button"
          onClick={() => addNode('start')}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-emerald-200"
          title="Add a start node"
        >
          <PlayCircle className="size-3.5" />
          <span>+ Start</span>
        </button>

        <button
          type="button"
          onClick={() => addNode('end')}
          className="flex items-center gap-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-green-200"
          title="Add an end node"
        >
          <CheckCircle className="size-3.5" />
          <span>+ End</span>
        </button>

        <button
          type="button"
          onClick={() => addNode('database')}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer border border-cyan-200 hidden md:flex"
          title="Add a database node"
        >
          <Database className="size-3.5" />
          <span>+ Database</span>
        </button>
      </div>

      {/* ── Selected Node Inspector Floating Panel ────────────── */}
      {selectedNode && (
        <div className="absolute top-16 right-4 z-20 w-72 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl p-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-1.5">
              <Edit2 className="size-3.5 text-gray-500" />
              <span className="text-xs font-bold text-gray-800">Edit Node</span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600 rounded p-1"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <form onSubmit={handleUpdateLabel} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Node Label / Text
              </label>
              <input
                type="text"
                autoFocus
                value={editingLabel}
                onChange={(e) => setEditingLabel(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
              >
                <Trash2 className="size-3" />
                <span>Delete</span>
              </button>
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-red-700 transition cursor-pointer"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── React Flow Interactive Canvas ─────────────────────── */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={handleNodeClick}
        onPaneClick={() => setSelectedNode(null)}
        fitView
      >
        <Controls className="!bg-white !border-gray-200 !shadow-sm !rounded-xl" />
        <MiniMap
          className="!bg-white !border-gray-200 !shadow-sm !rounded-xl"
          nodeColor={(n) => {
            if (n.type === 'input') return '#22c55e'
            if (n.type === 'output') return '#ef4444'
            return '#3b82f6'
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
      </ReactFlow>
    </div>
  )
}
