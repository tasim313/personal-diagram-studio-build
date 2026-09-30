'use client'

import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
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
  type ReactFlowInstance,
  BackgroundVariant,
  MarkerType,
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
  Server,
  Monitor,
  Cpu,
  Layers,
  Cloud,
  User,
  Radio,
  FileText,
  Clock,
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Sparkles,
  ArrowDownUp,
  ArrowLeftRight,
  Sliders,
  Copy,
} from 'lucide-react'
import { flowchartNodeTypes } from './flowchart/FlowchartNodes'
import { getLayoutedElements, type LayoutDirection } from './flowchart/layout'
import { buildExecutionTimeline, type SimulationStep } from './flowchart/simulation'

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
    type: 'flowStart',
    data: { label: 'Start Flow' },
    position: { x: 300, y: 40 },
  },
  {
    id: 'process-1',
    type: 'flowProcess',
    data: { label: 'Process Service Request' },
    position: { x: 275, y: 140 },
  },
  {
    id: 'decision-1',
    type: 'flowDecision',
    data: { label: 'Is Valid Input?' },
    position: { x: 285, y: 250 },
  },
  {
    id: 'end-success',
    type: 'flowEnd',
    data: { label: 'Success / Complete' },
    position: { x: 170, y: 390 },
  },
  {
    id: 'end-error',
    type: 'flowEnd',
    data: { label: 'Error Fallback' },
    position: { x: 400, y: 390 },
  },
]

const defaultInitialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: 'start-1',
    target: 'process-1',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e2-3',
    source: 'process-1',
    target: 'decision-1',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e3-4',
    source: 'decision-1',
    target: 'end-success',
    label: 'YES',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'e3-5',
    source: 'decision-1',
    target: 'end-error',
    label: 'NO',
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
]

export function ReactFlowEditor({ initialData, diagramType = 'flowchart', onChange }: ReactFlowEditorProps) {
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null)

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

  // Selection states
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [editingEdgeLabel, setEditingEdgeLabel] = useState('')
  const [edgeStyleType, setEdgeStyleType] = useState<'smoothstep' | 'bezier' | 'straight'>('smoothstep')

  // Simulation / Animation state
  const [isSimulating, setIsSimulating] = useState(false)
  const [simPlaying, setSimPlaying] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [simSpeed, setSimSpeed] = useState<number>(1) // 0.5x, 1x, 2x
  const [simulationTimeline, setSimulationTimeline] = useState<SimulationStep[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Register Custom Node Types
  const nodeTypes = useMemo(() => flowchartNodeTypes, [])

  // Propagate changes upwards safely
  const notifyChange = useCallback(
    (n: Node[], e: Edge[]) => {
      if (onChange) {
        // Strip temporary simulation highlight flags before saving
        const cleanedNodes = n.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isSimActive: undefined,
          },
        }))
        const cleanedEdges = e.map((edge) => ({
          ...edge,
          style: edge.style?.stroke === '#eab308' ? undefined : edge.style,
        }))
        onChange({ nodes: cleanedNodes, edges: cleanedEdges })
      }
    },
    [onChange]
  )

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return
      setEdges((eds) => {
        const newEdge: Edge = {
          id: `e-${Date.now()}`,
          source: params.source!,
          target: params.target!,
          sourceHandle: params.sourceHandle,
          targetHandle: params.targetHandle,
          type: edgeStyleType,
          markerEnd: { type: MarkerType.ArrowClosed },
        }
        const next = addEdge(newEdge, eds)
        notifyChange(nodes, next)
        return next
      })
    },
    [edgeStyleType, nodes, notifyChange, setEdges]
  )

  const handleNodeDragStop = useCallback(() => {
    notifyChange(nodes, edges)
  }, [edges, nodes, notifyChange])

  // Click handlers
  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setSelectedEdge(null)
    setEditingLabel(String(node.data?.label || ''))
  }

  const handleEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge)
    setSelectedNode(null)
    setEditingEdgeLabel(String(edge.label || ''))
  }

  const handlePaneClick = () => {
    setSelectedNode(null)
    setSelectedEdge(null)
  }

  // Node editing actions
  const handleUpdateNodeLabel = (e: React.FormEvent) => {
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
    notifyChange(updated, edges)
  }

  const handleDeleteSelectedNode = () => {
    if (!selectedNode) return
    const nextNodes = nodes.filter((n) => n.id !== selectedNode.id)
    const nextEdges = edges.filter(
      (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
    )
    setNodes(nextNodes)
    setEdges(nextEdges)
    setSelectedNode(null)
    notifyChange(nextNodes, nextEdges)
  }

  const handleDuplicateSelectedNode = () => {
    if (!selectedNode) return
    const newId = `node-${Date.now()}`
    const duplicatedNode: Node = {
      ...selectedNode,
      id: newId,
      position: {
        x: selectedNode.position.x + 40,
        y: selectedNode.position.y + 40,
      },
      data: {
        ...selectedNode.data,
        label: `${selectedNode.data?.label || 'Node'} (Copy)`,
      },
    }
    const updated = [...nodes, duplicatedNode]
    setNodes(updated)
    setSelectedNode(duplicatedNode)
    notifyChange(updated, edges)
  }

  // Edge editing actions
  const handleUpdateEdge = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEdge) return

    const updated = edges.map((ed) => {
      if (ed.id === selectedEdge.id) {
        return {
          ...ed,
          label: editingEdgeLabel || undefined,
        }
      }
      return ed
    })

    setEdges(updated)
    setSelectedEdge(null)
    notifyChange(nodes, updated)
  }

  const handleToggleEdgeAnimation = () => {
    if (!selectedEdge) return
    const updated = edges.map((ed) => {
      if (ed.id === selectedEdge.id) {
        return {
          ...ed,
          animated: !ed.animated,
        }
      }
      return ed
    })
    setEdges(updated)
    setSelectedEdge(updated.find((ed) => ed.id === selectedEdge.id) || null)
    notifyChange(nodes, updated)
  }

  const handleChangeEdgeType = (type: 'smoothstep' | 'bezier' | 'straight') => {
    if (!selectedEdge) return
    const updated = edges.map((ed) => {
      if (ed.id === selectedEdge.id) {
        return {
          ...ed,
          type,
        }
      }
      return ed
    })
    setEdges(updated)
    setSelectedEdge(updated.find((ed) => ed.id === selectedEdge.id) || null)
    notifyChange(nodes, updated)
  }

  const handleDeleteSelectedEdge = () => {
    if (!selectedEdge) return
    const nextEdges = edges.filter((e) => e.id !== selectedEdge.id)
    setEdges(nextEdges)
    setSelectedEdge(null)
    notifyChange(nodes, nextEdges)
  }

  // Auto-layout helper via Dagre
  const applyAutoLayout = (direction: LayoutDirection) => {
    const layouted = getLayoutedElements(nodes, edges, direction)
    setNodes([...layouted.nodes])
    setEdges([...layouted.edges])
    notifyChange(layouted.nodes, layouted.edges)
    setTimeout(() => {
      rfInstance?.fitView({ padding: 0.2, duration: 400 })
    }, 50)
  }

  // Add Node Helpers for Flowchart
  const addFlowchartNode = (
    type:
      | 'flowStart'
      | 'flowEnd'
      | 'flowProcess'
      | 'flowDecision'
      | 'flowInputOutput'
      | 'flowDatabase'
      | 'flowDocument'
      | 'flowSubprocess'
      | 'flowDelay'
      | 'flowPreparation'
      | 'flowComment'
  ) => {
    const id = `node-${Date.now()}`
    const xPos = 240 + Math.floor(Math.random() * 140)
    const yPos = 120 + Math.floor(Math.random() * 180)

    const defaultLabels: Record<string, string> = {
      flowStart: 'Start Flow',
      flowEnd: 'End Flow',
      flowProcess: 'Process Task',
      flowDecision: 'Decision Point?',
      flowInputOutput: 'Input / Output Data',
      flowDatabase: 'Database Store',
      flowDocument: 'Document Report',
      flowSubprocess: 'Subprocess Module',
      flowDelay: 'Delay / Wait',
      flowPreparation: 'Setup / Preparation',
      flowComment: 'Important note...',
    }

    const newNode: Node = {
      id,
      type,
      data: { label: defaultLabels[type] || 'New Step' },
      position: { x: xPos, y: yPos },
    }

    const updated = [...nodes, newNode]
    setNodes(updated)
    notifyChange(updated, edges)
  }

  // Add Node for Architecture & Sequence Diagrams
  const addArchNode = (
    nodeType: 'client' | 'gateway' | 'service' | 'database' | 'cache' | 'queue' | 'actor'
  ) => {
    const id = `node-${Date.now()}`
    const xPos = 200 + Math.floor(Math.random() * 160)
    const yPos = 100 + Math.floor(Math.random() * 200)

    let newNode: Node

    switch (nodeType) {
      case 'client':
        newNode = {
          id,
          type: 'input',
          data: { label: 'Web / Mobile Client' },
          position: { x: xPos, y: yPos },
          style: {
            background: '#faf5ff',
            border: '2px solid #a855f7',
            borderRadius: '12px',
            padding: '10px 20px',
            fontWeight: 600,
            color: '#7e22ce',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          },
        }
        break
      case 'gateway':
        newNode = {
          id,
          data: { label: 'API Gateway / LB' },
          position: { x: xPos, y: yPos },
          style: {
            background: '#fff1f2',
            border: '2px solid #f43f5e',
            borderRadius: '10px',
            padding: '10px 20px',
            fontWeight: 600,
            color: '#be123c',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          },
        }
        break
      case 'service':
        newNode = {
          id,
          data: { label: 'Microservice' },
          position: { x: xPos, y: yPos },
          style: {
            background: '#f8fafc',
            border: '2px solid #6366f1',
            borderRadius: '10px',
            padding: '12px 20px',
            fontWeight: 600,
            color: '#4338ca',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          },
        }
        break
      case 'database':
        newNode = {
          id,
          data: { label: 'Database / Store' },
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
      case 'cache':
        newNode = {
          id,
          data: { label: 'Redis Cache' },
          position: { x: xPos, y: yPos },
          style: {
            background: '#fdf2f8',
            border: '2px solid #ec4899',
            borderRadius: '8px',
            padding: '10px 18px',
            fontWeight: 600,
            color: '#be185d',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          },
        }
        break
      case 'queue':
        newNode = {
          id,
          data: { label: 'Queue / Kafka' },
          position: { x: xPos, y: yPos },
          style: {
            background: '#fefce8',
            border: '2px solid #ca8a04',
            borderRadius: '8px',
            padding: '10px 18px',
            fontWeight: 600,
            color: '#854d0e',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          },
        }
        break
      case 'actor':
      default:
        newNode = {
          id,
          type: 'input',
          data: { label: 'User / Actor' },
          position: { x: xPos, y: yPos },
          style: {
            background: '#eff6ff',
            border: '2px solid #3b82f6',
            borderRadius: '24px',
            padding: '10px 20px',
            fontWeight: 600,
            color: '#1d4ed8',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          },
        }
        break
    }

    const updated = [...nodes, newNode]
    setNodes(updated)
    notifyChange(updated, edges)
  }

  // ── Simulation Engine ───────────────────────────────────────
  const startSimulation = () => {
    const timeline = buildExecutionTimeline(nodes, edges)
    if (timeline.length === 0) return
    setSimulationTimeline(timeline)
    setIsSimulating(true)
    setSimPlaying(true)
    setCurrentStepIndex(0)
    highlightStep(0, timeline)
  }

  const highlightStep = (stepIdx: number, timeline: SimulationStep[]) => {
    if (stepIdx < 0 || stepIdx >= timeline.length) return
    const step = timeline[stepIdx]

    // Update nodes with isSimActive
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isSimActive: n.id === step.nodeId,
        },
      }))
    )

    // Update edges with active animated highlight
    setEdges((prev) =>
      prev.map((e) => ({
        ...e,
        animated: e.id === step.edgeId || e.animated,
        style:
          e.id === step.edgeId
            ? { ...e.style, stroke: '#eab308', strokeWidth: 3 }
            : e.style?.stroke === '#eab308'
            ? undefined
            : e.style,
      }))
    )
  }

  const stopSimulation = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsSimulating(false)
    setSimPlaying(false)
    setCurrentStepIndex(0)

    // Clear simulation highlights
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isSimActive: false,
        },
      }))
    )
    setEdges((prev) =>
      prev.map((e) => ({
        ...e,
        style: e.style?.stroke === '#eab308' ? undefined : e.style,
      }))
    )
  }

  const stepForward = () => {
    if (currentStepIndex < simulationTimeline.length - 1) {
      const nextIdx = currentStepIndex + 1
      setCurrentStepIndex(nextIdx)
      highlightStep(nextIdx, simulationTimeline)
    } else {
      setSimPlaying(false)
    }
  }

  const stepBackward = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1
      setCurrentStepIndex(prevIdx)
      highlightStep(prevIdx, simulationTimeline)
    }
  }

  // Simulation timer tick
  useEffect(() => {
    if (!isSimulating || !simPlaying) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    const intervalMs = 1200 / simSpeed

    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < simulationTimeline.length - 1) {
          const next = prev + 1
          highlightStep(next, simulationTimeline)
          return next
        } else {
          setSimPlaying(false)
          return prev
        }
      })
    }, intervalMs)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isSimulating, simPlaying, simSpeed, simulationTimeline])

  const isArch =
    diagramType.includes('architecture') ||
    diagramType.includes('api') ||
    diagramType.includes('cloud') ||
    diagramType.includes('network') ||
    diagramType.includes('software')

  const isSequence = diagramType.includes('sequence')

  return (
    <div className="h-full w-full bg-slate-50 relative overflow-hidden select-none">
      {/* ── Main Dynamic Toolbar ────────────────────────────────── */}
      <div className="absolute top-3 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-gray-200 shadow-md max-w-[calc(100vw-360px)]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1 hidden sm:inline">
          {diagramType.replace('-', ' ').toUpperCase()} TOOLS:
        </span>

        {/* ── Architecture Nodes ───────────────────────────────── */}
        {isArch ? (
          <>
            <button
              type="button"
              onClick={() => addArchNode('client')}
              className="flex items-center gap-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-1 text-xs font-semibold border border-purple-200 cursor-pointer"
            >
              <Monitor className="size-3" />
              <span>+ Client</span>
            </button>
            <button
              type="button"
              onClick={() => addArchNode('gateway')}
              className="flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-1 text-xs font-semibold border border-rose-200 cursor-pointer"
            >
              <Cloud className="size-3" />
              <span>+ Gateway</span>
            </button>
            <button
              type="button"
              onClick={() => addArchNode('service')}
              className="flex items-center gap-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 text-xs font-semibold border border-indigo-200 cursor-pointer"
            >
              <Cpu className="size-3" />
              <span>+ Service</span>
            </button>
            <button
              type="button"
              onClick={() => addArchNode('database')}
              className="flex items-center gap-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 text-xs font-semibold border border-blue-200 cursor-pointer"
            >
              <Database className="size-3" />
              <span>+ Database</span>
            </button>
            <button
              type="button"
              onClick={() => addArchNode('cache')}
              className="flex items-center gap-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 px-2 py-1 text-xs font-semibold border border-pink-200 cursor-pointer hidden md:flex"
            >
              <Layers className="size-3" />
              <span>+ Cache</span>
            </button>
            <button
              type="button"
              onClick={() => addArchNode('queue')}
              className="flex items-center gap-1 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-semibold border border-yellow-200 cursor-pointer hidden md:flex"
            >
              <Radio className="size-3" />
              <span>+ Queue</span>
            </button>
          </>
        ) : isSequence ? (
          <>
            <button
              type="button"
              onClick={() => addArchNode('actor')}
              className="flex items-center gap-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 text-xs font-semibold border border-blue-200 cursor-pointer"
            >
              <User className="size-3" />
              <span>+ Actor</span>
            </button>
            <button
              type="button"
              onClick={() => addArchNode('service')}
              className="flex items-center gap-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 text-xs font-semibold border border-indigo-200 cursor-pointer"
            >
              <Server className="size-3" />
              <span>+ Service</span>
            </button>
            <button
              type="button"
              onClick={() => addArchNode('database')}
              className="flex items-center gap-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 px-2 py-1 text-xs font-semibold border border-cyan-200 cursor-pointer"
            >
              <Database className="size-3" />
              <span>+ Database</span>
            </button>
          </>
        ) : (
          /* ── Complete Flowchart Enterprise Nodes ────────────── */
          <>
            <button
              type="button"
              onClick={() => addFlowchartNode('flowStart')}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 text-xs font-semibold border border-emerald-200 cursor-pointer"
              title="Add Flow Start Node"
            >
              <PlayCircle className="size-3.5" />
              <span>+ Start</span>
            </button>

            <button
              type="button"
              onClick={() => addFlowchartNode('flowProcess')}
              className="flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 text-xs font-semibold border border-blue-200 cursor-pointer"
              title="Add Process Step"
            >
              <Plus className="size-3.5" />
              <span>+ Process</span>
            </button>

            <button
              type="button"
              onClick={() => addFlowchartNode('flowDecision')}
              className="flex items-center gap-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 px-2.5 py-1.5 text-xs font-semibold border border-amber-200 cursor-pointer"
              title="Add Decision Diamond"
            >
              <GitBranch className="size-3.5" />
              <span>+ Decision</span>
            </button>

            <button
              type="button"
              onClick={() => addFlowchartNode('flowInputOutput')}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 px-2.5 py-1.5 text-xs font-semibold border border-cyan-200 cursor-pointer hidden md:flex"
              title="Add I/O Parallelogram"
            >
              <Sliders className="size-3.5" />
              <span>+ I/O Data</span>
            </button>

            <button
              type="button"
              onClick={() => addFlowchartNode('flowSubprocess')}
              className="flex items-center gap-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1.5 text-xs font-semibold border border-purple-200 cursor-pointer hidden md:flex"
              title="Add Subprocess Module"
            >
              <Layers className="size-3.5" />
              <span>+ Subprocess</span>
            </button>

            <button
              type="button"
              onClick={() => addFlowchartNode('flowDatabase')}
              className="flex items-center gap-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 px-2.5 py-1.5 text-xs font-semibold border border-sky-200 cursor-pointer hidden lg:flex"
              title="Add Database Store"
            >
              <Database className="size-3.5" />
              <span>+ Database</span>
            </button>

            <button
              type="button"
              onClick={() => addFlowchartNode('flowDocument')}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1.5 text-xs font-semibold border border-indigo-200 cursor-pointer hidden lg:flex"
              title="Add Document / Report"
            >
              <FileText className="size-3.5" />
              <span>+ Doc</span>
            </button>

            <button
              type="button"
              onClick={() => addFlowchartNode('flowDelay')}
              className="flex items-center gap-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 px-2.5 py-1.5 text-xs font-semibold border border-orange-200 cursor-pointer hidden xl:flex"
              title="Add Delay / Wait Node"
            >
              <Clock className="size-3.5" />
              <span>+ Delay</span>
            </button>

            <button
              type="button"
              onClick={() => addFlowchartNode('flowComment')}
              className="flex items-center gap-1.5 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-800 px-2.5 py-1.5 text-xs font-semibold border border-yellow-200 cursor-pointer hidden xl:flex"
              title="Add Sticky Note / Comment"
            >
              <MessageSquare className="size-3.5" />
              <span>+ Note</span>
            </button>

            <button
              type="button"
              onClick={() => addFlowchartNode('flowEnd')}
              className="flex items-center gap-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1.5 text-xs font-semibold border border-rose-200 cursor-pointer"
              title="Add Flow End Node"
            >
              <CheckCircle className="size-3.5" />
              <span>+ End</span>
            </button>
          </>
        )}

        {/* ── Auto Layout Dropdown / Actions ───────────────────── */}
        <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => applyAutoLayout('TB')}
            className="flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 text-xs font-semibold cursor-pointer transition"
            title="Auto-arrange nodes hierarchically (Top to Bottom)"
          >
            <ArrowDownUp className="size-3" />
            <span className="hidden sm:inline">Auto Layout (Vertical)</span>
          </button>
          <button
            type="button"
            onClick={() => applyAutoLayout('LR')}
            className="flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 text-xs font-semibold cursor-pointer transition hidden md:flex"
            title="Auto-arrange nodes horizontally (Left to Right)"
          >
            <ArrowLeftRight className="size-3" />
            <span>(Horizontal)</span>
          </button>
        </div>

        {/* ── Connector Style Picker ───────────────────────────── */}
        <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />
        <select
          value={edgeStyleType}
          onChange={(e) => setEdgeStyleType(e.target.value as 'smoothstep' | 'bezier' | 'straight')}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 focus:outline-none cursor-pointer"
          title="Default edge connection style"
        >
          <option value="smoothstep">Orthogonal (Elbow)</option>
          <option value="bezier">Curved (Bezier)</option>
          <option value="straight">Straight Line</option>
        </select>
      </div>

      {/* ── Simulation & Animation Floating Control Bar ──────────── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-gray-200 shadow-xl">
        {!isSimulating ? (
          <button
            type="button"
            onClick={startSimulation}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-md cursor-pointer transition"
          >
            <Play className="size-3.5 fill-white" />
            <span>Simulate Flow</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSimPlaying(!simPlaying)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer transition"
              title={simPlaying ? 'Pause' : 'Play'}
            >
              {simPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-slate-800" />}
            </button>

            <button
              type="button"
              onClick={stepBackward}
              disabled={currentStepIndex <= 0}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40 cursor-pointer transition"
              title="Previous Step"
            >
              <SkipBack className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={stepForward}
              disabled={currentStepIndex >= simulationTimeline.length - 1}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40 cursor-pointer transition"
              title="Next Step"
            >
              <SkipForward className="size-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentStepIndex(0)
                highlightStep(0, simulationTimeline)
              }}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer transition"
              title="Restart Simulation"
            >
              <RotateCcw className="size-3.5" />
            </button>

            {/* Step Counter Badge */}
            <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
              <Sparkles className="size-3 text-emerald-600" />
              <span>
                Step {currentStepIndex + 1} of {simulationTimeline.length}:
              </span>
              <span className="font-semibold text-slate-700 truncate max-w-[120px]">
                {simulationTimeline[currentStepIndex]?.nodeLabel}
              </span>
            </div>

            {/* Speed Selector */}
            <select
              value={simSpeed}
              onChange={(e) => setSimSpeed(Number(e.target.value))}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 cursor-pointer focus:outline-none"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1.0x</option>
              <option value={2}>2.0x</option>
            </select>

            <button
              type="button"
              onClick={stopSimulation}
              className="rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-1 text-xs font-semibold border border-rose-200 cursor-pointer ml-1"
            >
              Stop
            </button>
          </div>
        )}
      </div>

      {/* ── Node Inspector Floating Panel ───────────────────────── */}
      {selectedNode && (
        <div className="absolute top-16 right-4 z-20 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl p-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-1.5">
              <Edit2 className="size-3.5 text-gray-500" />
              <span className="text-xs font-bold text-gray-800">
                Edit {selectedNode.type?.replace('flow', '') || 'Node'}
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600 rounded p-1 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <form onSubmit={handleUpdateNodeLabel} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Node Label / Title
              </label>
              <input
                type="text"
                autoFocus
                value={editingLabel}
                onChange={(e) => setEditingLabel(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDeleteSelectedNode}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer p-1"
                  title="Delete node"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  type="button"
                  onClick={handleDuplicateSelectedNode}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 font-medium cursor-pointer p-1"
                  title="Duplicate node"
                >
                  <Copy className="size-3.5" />
                  <span>Duplicate</span>
                </button>
              </div>

              <button
                type="submit"
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition cursor-pointer"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Edge Inspector Floating Panel ───────────────────────── */}
      {selectedEdge && (
        <div className="absolute top-16 right-4 z-20 w-80 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl p-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-1.5">
              <GitBranch className="size-3.5 text-gray-500" />
              <span className="text-xs font-bold text-gray-800">Edit Connection / Branch</span>
            </div>
            <button
              onClick={() => setSelectedEdge(null)}
              className="text-gray-400 hover:text-gray-600 rounded p-1 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <form onSubmit={handleUpdateEdge} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Branch Label (e.g. YES, NO, Condition)
              </label>
              <input
                type="text"
                autoFocus
                value={editingEdgeLabel}
                placeholder="Optional branch condition..."
                onChange={(e) => setEditingEdgeLabel(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-red-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-gray-600">Curve Style</label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => handleChangeEdgeType('smoothstep')}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-md border cursor-pointer ${
                    selectedEdge.type === 'smoothstep'
                      ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  Orthogonal
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeEdgeType('bezier')}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-md border cursor-pointer ${
                    selectedEdge.type === 'bezier'
                      ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  Curved
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeEdgeType('straight')}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-md border cursor-pointer ${
                    selectedEdge.type === 'straight'
                      ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  Straight
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="text-[11px] font-semibold text-gray-700 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!selectedEdge.animated}
                  onChange={handleToggleEdgeAnimation}
                  className="rounded text-red-600 focus:ring-0"
                />
                <span>Animated Flow Particles</span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleDeleteSelectedEdge}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>Delete</span>
              </button>
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition cursor-pointer"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── React Flow Interactive Canvas ───────────────────────── */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={(instance) => setRfInstance(instance)}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        fitView
      >
        <Controls className="!bg-white !border-gray-200 !shadow-sm !rounded-xl" />
        <MiniMap
          className="!bg-white !border-gray-200 !shadow-sm !rounded-xl"
          nodeColor={(n) => {
            if (n.type === 'flowStart' || n.type === 'input') return '#22c55e'
            if (n.type === 'flowEnd' || n.type === 'output') return '#ef4444'
            if (n.type === 'flowDecision') return '#f59e0b'
            return '#3b82f6'
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
      </ReactFlow>
    </div>
  )
}
