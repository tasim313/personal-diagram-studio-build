import React, { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import {
  Play,
  CheckCircle,
  Database,
  FileText,
  Clock,
  Settings,
  MessageSquare,
  Layers,
  HelpCircle,
  ArrowRightCircle,
} from 'lucide-react'

// Common handle styling
const handleClass =
  'w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full transition hover:scale-125 hover:bg-red-500'

// 1. Flow Start Node (Oval / Pill)
export const FlowStartNode = memo(({ data, selected }: NodeProps) => {
  const isSimActive = data?.isSimActive
  return (
    <div
      className={`relative px-5 py-2.5 rounded-full flex items-center gap-2 border-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-xs shadow-md transition-all ${
        selected ? 'ring-3 ring-emerald-300 scale-105' : ''
      } ${isSimActive ? 'ring-4 ring-yellow-400 animate-pulse shadow-yellow-200 shadow-lg' : ''}`}
    >
      <Handle type="target" position={Position.Top} id="top" className={handleClass} />
      <Play className="size-3.5 fill-white text-white shrink-0" />
      <span className="tracking-wide">{data.label || 'Start'}</span>
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />
      <Handle type="target" position={Position.Left} id="left" className={handleClass} />
    </div>
  )
})
FlowStartNode.displayName = 'FlowStartNode'

// 2. Flow End Node (Oval / Pill)
export const FlowEndNode = memo(({ data, selected }: NodeProps) => {
  const isSimActive = data?.isSimActive
  return (
    <div
      className={`relative px-5 py-2.5 rounded-full flex items-center gap-2 border-2 bg-gradient-to-r from-rose-600 to-red-600 text-white font-semibold text-xs shadow-md transition-all ${
        selected ? 'ring-3 ring-rose-300 scale-105' : ''
      } ${isSimActive ? 'ring-4 ring-yellow-400 animate-pulse shadow-yellow-200 shadow-lg' : ''}`}
    >
      <Handle type="target" position={Position.Top} id="top" className={handleClass} />
      <CheckCircle className="size-3.5 text-white shrink-0" />
      <span className="tracking-wide">{data.label || 'End / Complete'}</span>
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClass} />
      <Handle type="target" position={Position.Left} id="left" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />
    </div>
  )
})
FlowEndNode.displayName = 'FlowEndNode'

// 3. Flow Process Step (Standard Rectangle)
export const FlowProcessNode = memo(({ data, selected }: NodeProps) => {
  const isSimActive = data?.isSimActive
  return (
    <div
      className={`relative min-w-[150px] max-w-[260px] px-4 py-3 rounded-xl border-2 bg-white text-slate-800 shadow-sm transition-all ${
        selected ? 'border-blue-600 ring-2 ring-blue-100 shadow-md' : 'border-slate-200 hover:border-blue-400'
      } ${isSimActive ? 'border-yellow-500 ring-4 ring-yellow-300 shadow-lg animate-pulse' : ''}`}
    >
      <Handle type="target" position={Position.Top} id="top" className={handleClass} />
      <Handle type="target" position={Position.Left} id="left" className={handleClass} />
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-md bg-blue-50 text-blue-600 shrink-0">
          <ArrowRightCircle className="size-3.5" />
        </div>
        <div className="text-xs font-semibold text-slate-800 break-words leading-tight">
          {data.label || 'Process Step'}
        </div>
      </div>
      {data.description && (
        <div className="text-[10px] text-slate-400 mt-1 pl-6 leading-snug">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />
    </div>
  )
})
FlowProcessNode.displayName = 'FlowProcessNode'

// 4. Flow Decision Node (Diamond / Rhombus)
export const FlowDecisionNode = memo(({ data, selected }: NodeProps) => {
  const isSimActive = data?.isSimActive
  return (
    <div
      className={`relative w-36 h-24 flex items-center justify-center transition-all ${
        isSimActive ? 'scale-110 drop-shadow-[0_0_12px_rgba(234,179,8,0.8)]' : ''
      }`}
    >
      {/* SVG Diamond */}
      <svg
        viewBox="0 0 140 90"
        className={`w-full h-full drop-shadow-xs transition-colors ${
          selected ? 'filter drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]' : ''
        }`}
      >
        <polygon
          points="70,4 136,45 70,86 4,45"
          fill="#fffbeb"
          stroke={selected ? '#d97706' : isSimActive ? '#eab308' : '#f59e0b'}
          strokeWidth="2.5"
        />
      </svg>

      {/* Handles at the 4 diamond apex points */}
      <Handle type="target" position={Position.Top} id="top" className={`${handleClass} !top-0`} />
      <Handle type="source" position={Position.Right} id="right" className={`${handleClass} !right-0`} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={`${handleClass} !bottom-0`} />
      <Handle type="target" position={Position.Left} id="left" className={`${handleClass} !left-0`} />

      <div className="absolute inset-x-6 inset-y-4 flex flex-col items-center justify-center text-center pointer-events-none">
        <HelpCircle className="size-3 text-amber-600 mb-0.5 shrink-0" />
        <span className="text-[11px] font-bold text-amber-950 leading-tight line-clamp-2 px-1">
          {data.label || 'Decision?'}
        </span>
      </div>
    </div>
  )
})
FlowDecisionNode.displayName = 'FlowDecisionNode'

// 5. Flow Input/Output Node (Parallelogram)
export const FlowInputOutputNode = memo(({ data, selected }: NodeProps) => {
  const isSimActive = data?.isSimActive
  return (
    <div
      className={`relative min-w-[160px] px-5 py-3 -skew-x-12 rounded-lg border-2 bg-cyan-50/80 text-cyan-950 shadow-xs transition-all ${
        selected ? 'border-cyan-600 ring-2 ring-cyan-200' : 'border-cyan-300 hover:border-cyan-500'
      } ${isSimActive ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
    >
      <Handle type="target" position={Position.Top} id="top" className={`${handleClass} skew-x-12`} />
      <Handle type="target" position={Position.Left} id="left" className={`${handleClass} skew-x-12`} />
      <div className="skew-x-12 flex items-center gap-2">
        <div className="text-[11px] font-semibold text-cyan-900 leading-tight">
          {data.label || 'Input / Data'}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" className={`${handleClass} skew-x-12`} />
      <Handle type="source" position={Position.Right} id="right" className={`${handleClass} skew-x-12`} />
    </div>
  )
})
FlowInputOutputNode.displayName = 'FlowInputOutputNode'

// 6. Flow Database Node (Cylinder)
export const FlowDatabaseNode = memo(({ data, selected }: NodeProps) => {
  const isSimActive = data?.isSimActive
  return (
    <div
      className={`relative min-w-[140px] px-4 py-3 rounded-xl border-2 bg-gradient-to-b from-sky-50 to-blue-50 text-slate-800 shadow-sm transition-all ${
        selected ? 'border-sky-600 ring-2 ring-sky-200' : 'border-sky-300 hover:border-sky-500'
      } ${isSimActive ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
    >
      <Handle type="target" position={Position.Top} id="top" className={handleClass} />
      <Handle type="target" position={Position.Left} id="left" className={handleClass} />
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-md bg-sky-100 text-sky-700">
          <Database className="size-4" />
        </div>
        <div className="text-xs font-bold text-slate-800">{data.label || 'Database'}</div>
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />
    </div>
  )
})
FlowDatabaseNode.displayName = 'FlowDatabaseNode'

// 7. Flow Document Node (Wave Bottom)
export const FlowDocumentNode = memo(({ data, selected }: NodeProps) => {
  const isSimActive = data?.isSimActive
  return (
    <div
      className={`relative min-w-[150px] px-4 pt-3 pb-4 rounded-t-xl border-2 border-b-0 bg-indigo-50/70 text-indigo-950 shadow-xs transition-all ${
        selected ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-indigo-300 hover:border-indigo-500'
      } ${isSimActive ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
    >
      <Handle type="target" position={Position.Top} id="top" className={handleClass} />
      <Handle type="target" position={Position.Left} id="left" className={handleClass} />
      <div className="flex items-center gap-2">
        <FileText className="size-3.5 text-indigo-600 shrink-0" />
        <span className="text-xs font-semibold text-indigo-900">{data.label || 'Document'}</span>
      </div>
      <div className="w-full h-1.5 bg-indigo-200 mt-2 rounded-full opacity-60" />
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />
    </div>
  )
})
FlowDocumentNode.displayName = 'FlowDocumentNode'

// 8. Flow Subprocess Node (Double Vertical Border)
export const FlowSubprocessNode = memo(({ data, selected }: NodeProps) => {
  const isSimActive = data?.isSimActive
  return (
    <div
      className={`relative min-w-[160px] px-4 py-3 rounded-lg border-2 border-purple-300 bg-purple-50/70 text-purple-950 shadow-sm transition-all ${
        selected ? 'border-purple-600 ring-2 ring-purple-200' : 'hover:border-purple-500'
      } ${isSimActive ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
    >
      {/* Subprocess vertical indicator bars */}
      <div className="absolute inset-y-1 left-2 w-1 border-r border-purple-300" />
      <div className="absolute inset-y-1 right-2 w-1 border-l border-purple-300" />

      <Handle type="target" position={Position.Top} id="top" className={handleClass} />
      <Handle type="target" position={Position.Left} id="left" className={handleClass} />
      <div className="px-3 flex items-center gap-2 justify-center">
        <Layers className="size-3.5 text-purple-600 shrink-0" />
        <span className="text-xs font-semibold text-purple-900">{data.label || 'Subprocess'}</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />
    </div>
  )
})
FlowSubprocessNode.displayName = 'FlowSubprocessNode'

// 9. Flow Delay Node
export const FlowDelayNode = memo(({ data, selected }: NodeProps) => {
  const isSimActive = data?.isSimActive
  return (
    <div
      className={`relative min-w-[130px] px-4 py-2.5 rounded-r-full rounded-l-md border-2 bg-amber-50 text-amber-950 shadow-xs flex items-center gap-2 transition-all ${
        selected ? 'border-amber-600 ring-2 ring-amber-200' : 'border-amber-300 hover:border-amber-500'
      } ${isSimActive ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
    >
      <Handle type="target" position={Position.Left} id="left" className={handleClass} />
      <Clock className="size-3.5 text-amber-600 shrink-0" />
      <span className="text-xs font-semibold text-amber-900">{data.label || 'Wait / Delay'}</span>
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClass} />
    </div>
  )
})
FlowDelayNode.displayName = 'FlowDelayNode'

// 10. Flow Preparation Node (Hexagon)
export const FlowPreparationNode = memo(({ data, selected }: NodeProps) => {
  const isSimActive = data?.isSimActive
  return (
    <div
      className={`relative min-w-[140px] px-5 py-2.5 rounded-md border-2 bg-slate-100 text-slate-800 shadow-xs flex items-center justify-center gap-2 transition-all ${
        selected ? 'border-slate-600 ring-2 ring-slate-300' : 'border-slate-300 hover:border-slate-500'
      } ${isSimActive ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
    >
      <Handle type="target" position={Position.Top} id="top" className={handleClass} />
      <Handle type="target" position={Position.Left} id="left" className={handleClass} />
      <Settings className="size-3.5 text-slate-600 shrink-0" />
      <span className="text-xs font-semibold text-slate-800">{data.label || 'Preparation'}</span>
      <Handle type="source" position={Position.Bottom} id="bottom" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />
    </div>
  )
})
FlowPreparationNode.displayName = 'FlowPreparationNode'

// 11. Flow Comment / Note Node
export const FlowCommentNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={`relative min-w-[140px] max-w-[200px] px-3.5 py-2.5 rounded-lg border-2 border-dashed bg-yellow-50/90 text-yellow-900 shadow-xs transition-all ${
        selected ? 'border-amber-500 ring-2 ring-amber-200' : 'border-amber-300'
      }`}
    >
      <div className="flex items-start gap-1.5">
        <MessageSquare className="size-3 text-amber-600 shrink-0 mt-0.5" />
        <span className="text-[11px] italic text-yellow-900 leading-snug">{data.label || 'Note / Comment'}</span>
      </div>
    </div>
  )
})
FlowCommentNode.displayName = 'FlowCommentNode'

export const flowchartNodeTypes = {
  flowStart: FlowStartNode,
  flowEnd: FlowEndNode,
  flowProcess: FlowProcessNode,
  flowDecision: FlowDecisionNode,
  flowInputOutput: FlowInputOutputNode,
  flowDatabase: FlowDatabaseNode,
  flowDocument: FlowDocumentNode,
  flowSubprocess: FlowSubprocessNode,
  flowDelay: FlowDelayNode,
  flowPreparation: FlowPreparationNode,
  flowComment: FlowCommentNode,
}
