import dagre from '@dagrejs/dagre'
import { Position, type Node, type Edge } from 'reactflow'

export type LayoutDirection = 'TB' | 'LR' | 'BT' | 'RL'

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection = 'TB'
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const isHorizontal = direction === 'LR' || direction === 'RL'
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: isHorizontal ? 60 : 70,
    ranksep: isHorizontal ? 90 : 80,
    marginx: 40,
    marginy: 40,
  })

  nodes.forEach((node) => {
    // Provide default dimensions based on node type
    let width = 180
    let height = 64

    if (node.type === 'flowDecision') {
      width = 160
      height = 90
    } else if (node.type === 'flowStart' || node.type === 'flowEnd') {
      width = 160
      height = 54
    } else if (node.type === 'flowComment') {
      width = 200
      height = 70
    } else if (node.type === 'flowDatabase') {
      width = 150
      height = 76
    }

    dagreGraph.setNode(node.id, { width, height })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    const width = (dagreGraph.node(node.id) as { width?: number })?.width || 180
    const height = (dagreGraph.node(node.id) as { height?: number })?.height || 60

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}
