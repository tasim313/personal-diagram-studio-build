import type { Node, Edge } from 'reactflow'

export interface SimulationStep {
  stepIndex: number
  nodeId: string
  nodeLabel: string
  nodeType?: string
  edgeId?: string
  branchLabel?: string
}

/**
 * Builds an execution path from start node to end node.
 * For decision branches, it traverses the primary branch or follows user selection.
 */
export function buildExecutionTimeline(nodes: Node[], edges: Edge[]): SimulationStep[] {
  if (nodes.length === 0) return []

  // 1. Find Start Node(s)
  const incomingEdgeCounts = new Map<string, number>()
  nodes.forEach((n) => incomingEdgeCounts.set(n.id, 0))
  edges.forEach((e) => {
    incomingEdgeCounts.set(e.target, (incomingEdgeCounts.get(e.target) || 0) + 1)
  })

  // Prefer type 'flowStart' or 'input', or zero in-degree
  let startNode = nodes.find((n) => n.type === 'flowStart' || n.type === 'input')
  if (!startNode) {
    startNode = nodes.find((n) => (incomingEdgeCounts.get(n.id) || 0) === 0) || nodes[0]
  }

  if (!startNode) return []

  const timeline: SimulationStep[] = []
  const visited = new Set<string>()
  let current: Node | undefined = startNode
  let previousEdge: Edge | undefined = undefined

  while (current && !visited.has(current.id) && timeline.length < 50) {
    visited.add(current.id)

    timeline.push({
      stepIndex: timeline.length + 1,
      nodeId: current.id,
      nodeLabel: String(current.data?.label || current.id),
      nodeType: current.type,
      edgeId: previousEdge?.id,
      branchLabel: typeof previousEdge?.label === 'string' ? previousEdge.label : undefined,
    })

    // If node is an end node, break
    if (current.type === 'flowEnd' || current.type === 'output') {
      break
    }

    // Find outgoing edges from current node
    const outgoing = edges.filter((e) => e.source === current!.id)
    if (outgoing.length === 0) break

    // Choose first edge (or prefer 'Yes' / 'Valid' branch if multiple)
    const nextEdge =
      outgoing.find(
        (e) =>
          typeof e.label === 'string' &&
          (e.label.toLowerCase().includes('yes') ||
            e.label.toLowerCase().includes('valid') ||
            e.label.toLowerCase().includes('success') ||
            e.label.toLowerCase().includes('true'))
      ) || outgoing[0]

    previousEdge = nextEdge
    current = nodes.find((n) => n.id === nextEdge.target)
  }

  return timeline
}
