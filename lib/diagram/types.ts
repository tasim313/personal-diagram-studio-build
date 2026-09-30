/**
 * Diagram Studio Phase 2 Type Definitions & Metadata
 */

export type DiagramEngineType = 'excalidraw' | 'reactflow' | 'gojs'

export type DiagramCategory =
  | 'general'
  | 'flow-process'
  | 'software-engineering'
  | 'database'
  | 'security'
  | 'ui-ux'
  | 'infrastructure'
  | 'project-management'

export interface DiagramTypeDefinition {
  id: string
  name: string
  description: string
  category: DiagramCategory
  recommendedEngine: DiagramEngineType
  iconName: string
  tags: string[]
}

export type ProjectType =
  | 'blank'
  | 'software-engineering'
  | 'application-architecture'
  | 'ui-ux'
  | 'database'
  | 'security'
  | 'devops-infra'
  | 'project-management'
  | 'custom'

export interface ProjectTypeTemplate {
  id: ProjectType
  label: string
  description: string
  iconName: string
  defaultDiagramTypes: string[] // List of diagram catalog IDs
}

export interface DiagramMetadata {
  parentDiagramId?: string
  relatedDiagramIds?: string[]
  workflowOrder?: number
  tags?: string[]
}

export interface DiagramItem {
  diagramId: string
  id?: string // alias for diagramId
  projectId: string
  name: string
  description?: string
  type: string // e.g. 'flowchart', 'erd', 'blank'
  category: DiagramCategory
  engine: DiagramEngineType
  data: unknown // Engine-specific editable model
  thumbnail?: string
  createdAt: string
  updatedAt: string
  version: number
  createdBy: string
  metadata?: DiagramMetadata
}

export interface StudioProject {
  id: string
  name: string
  description?: string
  projectType: ProjectType
  ownerId: string
  createdAt: string
  updatedAt: string
  thumbnail?: string
  settings?: Record<string, unknown>
  diagramIds: string[]
  createdBy?: string // alias/backward-compatibility
}

export const PROJECT_TEMPLATES: ProjectTypeTemplate[] = [
  {
    id: 'blank',
    label: 'Blank Project',
    description: 'Empty container to create any diagram from scratch.',
    iconName: 'FolderPlus',
    defaultDiagramTypes: [],
  },
  {
    id: 'software-engineering',
    label: 'Software Engineering',
    description: 'Complete system architecture, API flows, backend, and sequence diagrams.',
    iconName: 'Boxes',
    defaultDiagramTypes: [
      'freeform',
      'flowchart',
      'system-architecture',
      'erd',
      'activity-diagram',
      'api-flow',
      'sequence-diagram',
    ],
  },
  {
    id: 'application-architecture',
    label: 'Application Architecture',
    description: 'Multi-tier app topology, component maps, and state flows.',
    iconName: 'Layers',
    defaultDiagramTypes: [
      'software-architecture',
      'component-diagram',
      'state-diagram',
      'api-flow',
    ],
  },
  {
    id: 'ui-ux',
    label: 'UI / UX Design',
    description: 'User personas, journeys, screen navigation, and wireframe sketches.',
    iconName: 'Palette',
    defaultDiagramTypes: [
      'user-journey',
      'screen-flow',
      'wireframe',
      'ui-architecture',
    ],
  },
  {
    id: 'database',
    label: 'Database Design',
    description: 'Relational ERD, schemas, data flows, and replication architecture.',
    iconName: 'Database',
    defaultDiagramTypes: [
      'erd',
      'database-schema',
      'data-flow',
      'database-architecture',
    ],
  },
  {
    id: 'security',
    label: 'Security Design',
    description: 'Threat models, trust boundaries, auth flows, and network security.',
    iconName: 'Shield',
    defaultDiagramTypes: [
      'security-architecture',
      'threat-model',
      'authentication-flow',
      'authorization-flow',
      'trust-boundary',
    ],
  },
  {
    id: 'devops-infra',
    label: 'DevOps / Infrastructure',
    description: 'Cloud topologies, servers, networks, and CI/CD automated pipelines.',
    iconName: 'Cloud',
    defaultDiagramTypes: [
      'cloud-architecture',
      'network-diagram',
      'server-architecture',
      'cicd-workflow',
    ],
  },
  {
    id: 'project-management',
    label: 'Project Management',
    description: 'Roadmaps, timelines, milestones, and task dependency graphs.',
    iconName: 'Kanban',
    defaultDiagramTypes: [
      'roadmap',
      'timeline',
      'dependency-diagram',
      'kanban',
      'milestone-map',
    ],
  },
  {
    id: 'custom',
    label: 'Custom Engineering',
    description: 'Tailored multi-diagram engineering workspace.',
    iconName: 'Sparkles',
    defaultDiagramTypes: ['system-architecture', 'flowchart'],
  },
]

/**
 * Unified Diagram Engine Abstraction Interface (Section 6)
 */
export interface DiagramEngineAdapter {
  readonly engineType: DiagramEngineType
  load(data: unknown): void
  save(): unknown
  exportPNG?(): Promise<Blob>
  exportSVG?(): Promise<Blob>
  exportJSON?(): Promise<Blob>
  exportExcalidraw?(): Promise<Blob>
}

export interface EngineCapabilities {
  engineType: DiagramEngineType
  displayName: string
  description: string
  supportedFormats: ('json' | 'png' | 'svg' | 'pdf' | 'jpg' | 'excalidraw')[]
  bestFor: string[]
}

export const ENGINE_CAPABILITIES: Record<DiagramEngineType, EngineCapabilities> = {
  excalidraw: {
    engineType: 'excalidraw',
    displayName: 'Excalidraw Engine',
    description: 'Virtual whiteboard for hand-drawn sketches, freeform architecture, and UI mockups.',
    supportedFormats: ['json', 'excalidraw', 'png', 'svg', 'pdf', 'jpg'],
    bestFor: ['Freeform', 'Whiteboard', 'Architecture sketch', 'UI sketch', 'Brainstorming'],
  },
  reactflow: {
    engineType: 'reactflow',
    displayName: 'React Flow Engine',
    description: 'Node-based interactive graph engine with custom node rendering and connection routing.',
    supportedFormats: ['json', 'png', 'svg', 'pdf', 'jpg'],
    bestFor: ['Flowchart', 'Workflow', 'Activity diagram', 'Process flow', 'State flow'],
  },
  gojs: {
    engineType: 'gojs',
    displayName: 'GoJS Structured Engine',
    description: 'Industrial-grade diagramming library for entity-relationship, UML, and complex engineering schemas.',
    supportedFormats: ['json', 'png', 'svg', 'pdf', 'jpg'],
    bestFor: ['ERD', 'UML', 'Class diagram', 'Sequence diagram', 'Network architecture'],
  },
}

export const DIAGRAM_CATEGORIES: { id: DiagramCategory; label: string; description: string }[] = [
  { id: 'general', label: 'General', description: 'Freeform whiteboards & general sketches' },
  { id: 'flow-process', label: 'Flow & Process', description: 'Flowcharts, workflows, and state logic' },
  { id: 'software-engineering', label: 'Software Engineering', description: 'System, component, and UML architectures' },
  { id: 'database', label: 'Database', description: 'Entity-relationship and schema designs' },
  { id: 'security', label: 'Security', description: 'Threat models, trust boundaries, and auth flows' },
  { id: 'ui-ux', label: 'UI / UX', description: 'Wireframes, screen flows, and user journeys' },
  { id: 'infrastructure', label: 'Infrastructure', description: 'Cloud, network, server, and DevOps pipelines' },
  { id: 'project-management', label: 'Project Management', description: 'Roadmaps, timelines, and dependency maps' },
]

/**
 * Complete catalog of diagram types according to Phase 2 Section 4
 */
export const DIAGRAM_CATALOG: DiagramTypeDefinition[] = [
  // ── General ──────────────────────────────────────────────────────────
  {
    id: 'blank',
    name: 'Blank Diagram',
    description: 'Empty canvas to start from scratch with freeform tools.',
    category: 'general',
    recommendedEngine: 'excalidraw',
    iconName: 'PenTool',
    tags: ['blank', 'freeform', 'scratch'],
  },
  {
    id: 'freeform',
    name: 'Freeform Diagram',
    description: 'Hand-drawn shapes, text notes, and creative brainstorm diagrams.',
    category: 'general',
    recommendedEngine: 'excalidraw',
    iconName: 'Sparkles',
    tags: ['draw', 'sketch', 'creative'],
  },
  {
    id: 'whiteboard',
    name: 'Whiteboard',
    description: 'Collaborative infinite whiteboard for team ideation.',
    category: 'general',
    recommendedEngine: 'excalidraw',
    iconName: 'Layout',
    tags: ['whiteboard', 'canvas', 'meeting'],
  },

  // ── Flow & Process ────────────────────────────────────────────────────
  {
    id: 'flowchart',
    name: 'Flowchart',
    description: 'Process steps, decision diamonds, start/end nodes, and logic flows.',
    category: 'flow-process',
    recommendedEngine: 'reactflow',
    iconName: 'GitBranch',
    tags: ['logic', 'decision', 'algorithm', 'step-by-step'],
  },
  {
    id: 'workflow',
    name: 'Workflow',
    description: 'Trigger, condition, and action automation pipeline.',
    category: 'flow-process',
    recommendedEngine: 'reactflow',
    iconName: 'Workflow',
    tags: ['automation', 'pipeline', 'triggers', 'actions'],
  },
  {
    id: 'process-flow',
    name: 'Process Flow',
    description: 'High-level business operations and standard procedures.',
    category: 'flow-process',
    recommendedEngine: 'reactflow',
    iconName: 'Activity',
    tags: ['operations', 'business', 'procedure'],
  },
  {
    id: 'activity-diagram',
    name: 'Activity Diagram',
    description: 'UML activity control flow with forks, joins, and decision branches.',
    category: 'flow-process',
    recommendedEngine: 'reactflow',
    iconName: 'GitCommit',
    tags: ['uml', 'concurrency', 'fork', 'join'],
  },
  {
    id: 'decision-tree',
    name: 'Decision Tree',
    description: 'Branching tree structure evaluating sequential outcomes and criteria.',
    category: 'flow-process',
    recommendedEngine: 'reactflow',
    iconName: 'GitFork',
    tags: ['tree', 'conditional', 'evaluation'],
  },
  {
    id: 'state-diagram',
    name: 'State Diagram',
    description: 'Finite state machine modeling system states and event transitions.',
    category: 'flow-process',
    recommendedEngine: 'reactflow',
    iconName: 'CircleDot',
    tags: ['fsm', 'states', 'transitions', 'events'],
  },
  {
    id: 'user-flow',
    name: 'User Flow',
    description: 'Sequential steps a user takes through an application journey.',
    category: 'flow-process',
    recommendedEngine: 'reactflow',
    iconName: 'Navigation',
    tags: ['ux', 'steps', 'journey', 'navigation'],
  },

  // ── Software Engineering ──────────────────────────────────────────────
  {
    id: 'system-architecture',
    name: 'System Architecture',
    description: 'High-level topology of clients, gateways, microservices, and databases.',
    category: 'software-engineering',
    recommendedEngine: 'reactflow',
    iconName: 'Boxes',
    tags: ['architecture', 'microservices', 'services'],
  },
  {
    id: 'software-architecture',
    name: 'Software Architecture',
    description: 'Layered or modular software design showing tiers and boundaries.',
    category: 'software-engineering',
    recommendedEngine: 'reactflow',
    iconName: 'Layers',
    tags: ['layers', 'clean-architecture', 'modules'],
  },
  {
    id: 'component-diagram',
    name: 'Component Diagram',
    description: 'UML structural breakdown of modules, interfaces, and packages.',
    category: 'software-engineering',
    recommendedEngine: 'gojs',
    iconName: 'Cpu',
    tags: ['components', 'interfaces', 'packages'],
  },
  {
    id: 'sequence-diagram',
    name: 'Sequence Diagram',
    description: 'Chronological message exchanges between lifelines and actors.',
    category: 'software-engineering',
    recommendedEngine: 'gojs',
    iconName: 'ListOrdered',
    tags: ['sequence', 'lifeline', 'messages', 'timing'],
  },
  {
    id: 'class-diagram',
    name: 'Class Diagram',
    description: 'Object-oriented classes, attributes, methods, and relationships.',
    category: 'software-engineering',
    recommendedEngine: 'gojs',
    iconName: 'FileCode2',
    tags: ['classes', 'oop', 'inheritance', 'methods'],
  },
  {
    id: 'deployment-diagram',
    name: 'Deployment Diagram',
    description: 'Physical hardware nodes, virtual machines, and deployed artifacts.',
    category: 'software-engineering',
    recommendedEngine: 'gojs',
    iconName: 'HardDrive',
    tags: ['servers', 'nodes', 'artifacts'],
  },
  {
    id: 'api-flow',
    name: 'API Flow',
    description: 'Client requests, middleware, controller processing, and response cycle.',
    category: 'software-engineering',
    recommendedEngine: 'reactflow',
    iconName: 'Radio',
    tags: ['api', 'rest', 'graphql', 'http'],
  },
  {
    id: 'backend-architecture',
    name: 'Backend Architecture',
    description: 'Controllers, services, queues, repositories, and cache layers.',
    category: 'software-engineering',
    recommendedEngine: 'reactflow',
    iconName: 'Server',
    tags: ['backend', 'cache', 'queue', 'repository'],
  },
  {
    id: 'frontend-architecture',
    name: 'Frontend Architecture',
    description: 'Pages, component tree, state management stores, and API clients.',
    category: 'software-engineering',
    recommendedEngine: 'reactflow',
    iconName: 'Monitor',
    tags: ['frontend', 'react', 'state', 'components'],
  },

  // ── Database ──────────────────────────────────────────────────────────
  {
    id: 'erd',
    name: 'ERD (Entity Relationship)',
    description: 'Data models, entities, primary/foreign keys, and 1:N cardinalities.',
    category: 'database',
    recommendedEngine: 'gojs',
    iconName: 'Database',
    tags: ['sql', 'tables', 'foreign-key', 'relational'],
  },
  {
    id: 'database-schema',
    name: 'Database Schema',
    description: 'Detailed table schemas, data types, indexes, and constraints.',
    category: 'database',
    recommendedEngine: 'gojs',
    iconName: 'TableProperties',
    tags: ['schema', 'columns', 'indexes'],
  },
  {
    id: 'data-flow',
    name: 'Data Flow Diagram (DFD)',
    description: 'Flow of information through inputs, processes, data stores, and outputs.',
    category: 'database',
    recommendedEngine: 'reactflow',
    iconName: 'ArrowRightLeft',
    tags: ['dfd', 'data-store', 'stream'],
  },
  {
    id: 'database-architecture',
    name: 'Database Architecture',
    description: 'Replication, sharding, master-slave clusters, and connection pooling.',
    category: 'database',
    recommendedEngine: 'reactflow',
    iconName: 'HardDriveDownload',
    tags: ['clustering', 'replication', 'shards'],
  },

  // ── Security ──────────────────────────────────────────────────────────
  {
    id: 'security-architecture',
    name: 'Security Architecture',
    description: 'Defense-in-depth layout: firewalls, WAF, API gateways, and encryption.',
    category: 'security',
    recommendedEngine: 'reactflow',
    iconName: 'Shield',
    tags: ['security', 'waf', 'firewall', 'protection'],
  },
  {
    id: 'threat-model',
    name: 'Threat Model (STRIDE)',
    description: 'Threat identification across spoofing, tampering, and elevation of privilege.',
    category: 'security',
    recommendedEngine: 'reactflow',
    iconName: 'ShieldAlert',
    tags: ['stride', 'vulnerabilities', 'threats'],
  },
  {
    id: 'authentication-flow',
    name: 'Authentication Flow',
    description: 'OAuth2, JWT handshake, session cookie generation, and token refresh.',
    category: 'security',
    recommendedEngine: 'reactflow',
    iconName: 'KeyRound',
    tags: ['auth', 'jwt', 'session', 'oauth'],
  },
  {
    id: 'authorization-flow',
    name: 'Authorization Flow',
    description: 'RBAC and ABAC role evaluation, permission checks, and access tokens.',
    category: 'security',
    recommendedEngine: 'reactflow',
    iconName: 'Lock',
    tags: ['rbac', 'permissions', 'access-control'],
  },
  {
    id: 'network-security',
    name: 'Network Security',
    description: 'VPCs, subnets, bastion hosts, ingress/egress security groups.',
    category: 'security',
    recommendedEngine: 'gojs',
    iconName: 'Network',
    tags: ['vpc', 'subnets', 'ingress', 'firewall'],
  },
  {
    id: 'trust-boundary',
    name: 'Trust Boundary Diagram',
    description: 'Demarcation between trusted internal networks and public internet.',
    category: 'security',
    recommendedEngine: 'reactflow',
    iconName: 'ShieldCheck',
    tags: ['boundary', 'dmz', 'zero-trust'],
  },

  // ── UI / UX ───────────────────────────────────────────────────────────
  {
    id: 'wireframe',
    name: 'Wireframe',
    description: 'Low-fidelity layout blueprints for web, tablet, and mobile screens.',
    category: 'ui-ux',
    recommendedEngine: 'excalidraw',
    iconName: 'LayoutGrid',
    tags: ['wireframe', 'lo-fi', 'layout', 'mockup'],
  },
  {
    id: 'user-journey',
    name: 'User Journey',
    description: 'End-to-end customer persona journey with feelings, touchpoints, and actions.',
    category: 'ui-ux',
    recommendedEngine: 'reactflow',
    iconName: 'Compass',
    tags: ['persona', 'touchpoints', 'customer'],
  },
  {
    id: 'screen-flow',
    name: 'Screen Flow',
    description: 'Interactive navigation mapping screen transitions and UI states.',
    category: 'ui-ux',
    recommendedEngine: 'reactflow',
    iconName: 'Smartphone',
    tags: ['screens', 'views', 'navigation'],
  },
  {
    id: 'ui-architecture',
    name: 'UI Architecture',
    description: 'Design system tokens, component hierarchy, and design tokens.',
    category: 'ui-ux',
    recommendedEngine: 'reactflow',
    iconName: 'Palette',
    tags: ['design-system', 'tokens', 'components'],
  },

  // ── Infrastructure ────────────────────────────────────────────────────
  {
    id: 'network-diagram',
    name: 'Network Diagram',
    description: 'Routers, switches, VLANs, IP subnets, and physical connections.',
    category: 'infrastructure',
    recommendedEngine: 'gojs',
    iconName: 'Router',
    tags: ['lan', 'wan', 'topology', 'switches'],
  },
  {
    id: 'cloud-architecture',
    name: 'Cloud Architecture',
    description: 'AWS / GCP / Azure resource topology, compute, and load balancing.',
    category: 'infrastructure',
    recommendedEngine: 'reactflow',
    iconName: 'Cloud',
    tags: ['aws', 'gcp', 'azure', 'cloud'],
  },
  {
    id: 'server-architecture',
    name: 'Server Architecture',
    description: 'Load balancers, reverse proxies, worker nodes, and Redis clusters.',
    category: 'infrastructure',
    recommendedEngine: 'reactflow',
    iconName: 'ServerCrash',
    tags: ['proxy', 'cluster', 'nginx', 'compute'],
  },
  {
    id: 'devops-pipeline',
    name: 'DevOps Pipeline',
    description: 'Build, automated test, containerize, scan, and deploy phases.',
    category: 'infrastructure',
    recommendedEngine: 'reactflow',
    iconName: 'GitPullRequest',
    tags: ['devops', 'automation', 'docker', 'deploy'],
  },
  {
    id: 'cicd-workflow',
    name: 'CI/CD Workflow',
    description: 'Git push trigger, GitHub actions / GitLab runner jobs, and release flow.',
    category: 'infrastructure',
    recommendedEngine: 'reactflow',
    iconName: 'RefreshCw',
    tags: ['ci-cd', 'github-actions', 'release'],
  },

  // ── Project Management ────────────────────────────────────────────────
  {
    id: 'project-workflow',
    name: 'Project Workflow',
    description: 'Agile sprints, milestone checkpoints, and team handoffs.',
    category: 'project-management',
    recommendedEngine: 'reactflow',
    iconName: 'Kanban',
    tags: ['agile', 'sprint', 'scrum'],
  },
  {
    id: 'roadmap',
    name: 'Product Roadmap',
    description: 'Quarterly deliverables, strategic goals, and feature releases.',
    category: 'project-management',
    recommendedEngine: 'reactflow',
    iconName: 'Milestone',
    tags: ['roadmap', 'goals', 'releases'],
  },
  {
    id: 'timeline',
    name: 'Timeline & Gantt',
    description: 'Time-sequenced phases with start/end estimates and task durations.',
    category: 'project-management',
    recommendedEngine: 'gojs',
    iconName: 'Clock',
    tags: ['gantt', 'schedule', 'milestones'],
  },
  {
    id: 'dependency-diagram',
    name: 'Dependency Diagram',
    description: 'Directed acyclic graph of task, package, and team blockers.',
    category: 'project-management',
    recommendedEngine: 'gojs',
    iconName: 'GitCompare',
    tags: ['blockers', 'dag', 'dependencies'],
  },
  {
    id: 'kanban',
    name: 'Kanban Board Map',
    description: 'Backlog, In Progress, Review, and Done flow stages.',
    category: 'project-management',
    recommendedEngine: 'reactflow',
    iconName: 'Columns3',
    tags: ['board', 'wip', 'backlog'],
  },
  {
    id: 'milestone-map',
    name: 'Milestone Map',
    description: 'High-level project gates, launch criteria, and sign-off points.',
    category: 'project-management',
    recommendedEngine: 'reactflow',
    iconName: 'Flag',
    tags: ['launch', 'gates', 'criteria'],
  },
]
