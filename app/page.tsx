'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Activity,
  ArrowDown,
  Box,
  CheckSquare,
  Cloud,
  Copy,
  Cpu,
  Database,
  Diamond,
  Download,
  Eye,
  FileText,
  FolderKanban,
  GitBranch,
  KanbanSquare,
  Layers,
  Layout,
  Link2,
  Lock,
  Network,
  Palette,
  PenTool,
  Rocket,
  Server,
  Share2,
  Shield,
  ShieldCheck,
  Upload,
  UserCheck,
} from 'lucide-react'

// ── Animation ────────────────────────────────────────────────
const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}
const spring = { duration: 0.5, ease: 'easeOut' as const }
const vp = { once: true, margin: '-60px' as const }

// ── Data ─────────────────────────────────────────────────────
const capabilities = [
  {
    icon: PenTool,
    title: 'Design',
    text: 'Create visual diagrams for every layer of your project',
  },
  {
    icon: Link2,
    title: 'Connect',
    text: 'Link design documents across lifecycle stages',
  },
  {
    icon: FileText,
    title: 'Document',
    text: 'Generate documentation from visual designs',
  },
  {
    icon: FolderKanban,
    title: 'Manage',
    text: 'Organize unlimited projects with collaboration',
  },
  {
    icon: Share2,
    title: 'Share',
    text: 'Share securely with role-based access controls',
  },
]

const diagramTypes = [
  { icon: GitBranch, name: 'Flowcharts' },
  { icon: Activity, name: 'Activity Diagrams' },
  { icon: Database, name: 'ERD' },
  { icon: Box, name: 'UML' },
  { icon: Layers, name: 'Architecture' },
  { icon: Shield, name: 'Security' },
  { icon: Server, name: 'Database' },
  { icon: Layout, name: 'Frontend' },
  { icon: Cpu, name: 'Backend' },
  { icon: Palette, name: 'UI/UX' },
  { icon: Rocket, name: 'DevOps' },
  { icon: Cloud, name: 'Cloud' },
  { icon: Network, name: 'Network' },
  { icon: KanbanSquare, name: 'Project Mgmt' },
]

const engines = [
  {
    name: 'Excalidraw',
    desc: 'Freeform sketching and whiteboard',
    uses: [
      'Architecture sketches',
      'Brainstorming',
      'UI wireframes',
      'Documentation diagrams',
    ],
  },
  {
    name: 'React Flow',
    desc: 'Structured node-based workflows',
    uses: ['Flowcharts', 'Workflows', 'Data flows', 'State machines'],
  },
  {
    name: 'GoJS',
    desc: 'Advanced engineering diagrams',
    uses: ['ERD', 'UML', 'Organization charts', 'Network diagrams'],
  },
]

const workflowSteps = [
  'Idea',
  'Requirements',
  'UI/UX',
  'Frontend',
  'Backend',
  'Database',
  'Security',
  'Testing',
  'Deployment',
  'Monitoring',
]

const securityFeatures = [
  {
    icon: Lock,
    title: 'Secure Authentication',
    text: 'Firebase Email & Password Auth',
  },
  {
    icon: Server,
    title: 'Server Sessions',
    text: 'HttpOnly cookie sessions',
  },
  {
    icon: UserCheck,
    title: 'Authorization',
    text: 'Role-based access control',
  },
  {
    icon: Shield,
    title: 'Project Isolation',
    text: 'Complete data separation',
  },
  {
    icon: Share2,
    title: 'Secure Sharing',
    text: 'Unpredictable share tokens',
  },
  {
    icon: ShieldCheck,
    title: 'Firestore Rules',
    text: 'Deny-by-default policies',
  },
  { icon: Lock, title: 'Storage Rules', text: 'Authorized file access only' },
  {
    icon: CheckSquare,
    title: 'Server Validation',
    text: 'Every mutation validated',
  },
]

const exportFeatures = [
  { icon: Upload, title: 'Export' },
  { icon: Download, title: 'Download' },
  { icon: Share2, title: 'Share' },
  { icon: Eye, title: 'View' },
  { icon: Copy, title: 'Duplicate' },
]

const projectExamples = [
  'Hospital Management',
  'E-Commerce Platform',
  'Banking Application',
  'ERP System',
  'Mobile App',
  'Network Infrastructure',
  'CRM Platform',
]

// ── Component ────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-600">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-200 ${
          scrolled ? 'shadow-sm' : ''
        } border-b border-gray-100 bg-white/95 backdrop-blur-sm`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-red-600">
              <Diamond className="size-4 text-white" />
            </div>
            <span className="hidden text-sm font-semibold text-gray-600 sm:inline">
              Visual Engineering Studio
            </span>
            <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600">
              Enterprise
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#explore"
              className="hidden text-sm text-gray-400 sm:inline"
            >
              Explore Platform
            </a>
            <Link
              href="/auth/sign-in"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4 pt-14">
        {/* Decorative shapes */}
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-red-50 opacity-60" />
        <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-red-50/40" />
        <div className="absolute right-1/4 top-1/3 size-4 rounded-full bg-red-200" />
        <div className="absolute bottom-1/4 left-1/3 size-6 rounded-full bg-red-100" />
        <div className="absolute right-1/3 bottom-1/3 size-2 rounded-full bg-red-300" />

        <motion.div
          className="relative z-10 mx-auto max-w-3xl text-center"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          <motion.div variants={fade} transition={spring}>
            <span className="inline-block rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-red-600">
              Enterprise Platform
            </span>
          </motion.div>

          <motion.h1
            className="mt-8 text-4xl font-bold leading-tight text-gray-600 sm:text-5xl lg:text-6xl"
            variants={fade}
            transition={spring}
          >
            Design Your Entire
            <br />
            <span className="text-red-600">Project Visually</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg"
            variants={fade}
            transition={spring}
          >
            Design workflows, architecture, security, databases, UI systems,
            frontend, backend and complete software projects in one visual
            engineering workspace.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            variants={fade}
            transition={spring}
          >
            <Link
              href="/auth/sign-in"
              className="rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition"
            >
              Get Started
            </Link>
            <a
              href="#explore"
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-500"
            >
              Explore Platform
              <ArrowDown className="size-3.5" />
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Visual Engineering ──────────────────────────────── */}
      <section
        id="explore"
        className="border-t border-gray-100 bg-gray-50/50 px-4 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={fade}
            transition={spring}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-red-600">
              Capabilities
            </span>
            <h2 className="mt-3 text-2xl font-bold text-gray-600 sm:text-3xl">
              Visual Engineering
            </h2>
            <p className="mt-3 text-gray-400">
              One platform for your entire project lifecycle
            </p>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-6 sm:grid-cols-3 lg:grid-cols-5"
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={{
              visible: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {capabilities.map((c) => (
              <motion.div
                key={c.title}
                className="rounded-xl border border-gray-100 bg-white p-6 text-center"
                variants={fade}
                transition={spring}
              >
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-red-50">
                  <c.icon className="size-5 text-red-600" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-gray-600">
                  {c.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                  {c.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Diagram Types ──────────────────────────────────── */}
      <section className="border-t border-gray-100 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={fade}
            transition={spring}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-red-600">
              Coverage
            </span>
            <h2 className="mt-3 text-2xl font-bold text-gray-600 sm:text-3xl">
              Comprehensive Diagram Types
            </h2>
          </motion.div>

          <motion.div
            className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7"
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={{
              visible: { transition: { staggerChildren: 0.04 } },
            }}
          >
            {diagramTypes.map((d) => (
              <motion.div
                key={d.name}
                className="flex flex-col items-center gap-2.5 rounded-xl border border-gray-100 bg-white p-4"
                variants={fade}
                transition={spring}
              >
                <d.icon className="size-5 text-red-600" />
                <span className="text-xs font-medium text-gray-500">
                  {d.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Multi-Engine Architecture ──────────────────────── */}
      <section className="border-t border-gray-100 bg-red-50/40 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={fade}
            transition={spring}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-red-600">
              Architecture
            </span>
            <h2 className="mt-3 text-2xl font-bold text-gray-600 sm:text-3xl">
              Multi-Engine Architecture
            </h2>
            <p className="mt-3 text-gray-400">
              The right engine for every diagram type
            </p>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-6 md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {engines.map((e) => (
              <motion.div
                key={e.name}
                className="rounded-xl border border-gray-100 bg-white p-6"
                variants={fade}
                transition={spring}
              >
                <h3 className="text-base font-bold text-gray-600">
                  {e.name}
                </h3>
                <p className="mt-1 text-sm text-gray-400">{e.desc}</p>
                <ul className="mt-4 space-y-2">
                  {e.uses.map((u) => (
                    <li
                      key={u}
                      className="flex items-center gap-2 text-xs text-gray-500"
                    >
                      <span className="size-1 shrink-0 rounded-full bg-red-400" />
                      {u}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Project Workflow ────────────────────────────────── */}
      <section className="border-t border-gray-100 px-4 py-24">
        <div className="mx-auto max-w-3xl">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={fade}
            transition={spring}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-red-600">
              Lifecycle
            </span>
            <h2 className="mt-3 text-2xl font-bold text-gray-600 sm:text-3xl">
              Complete Project Workflow
            </h2>
          </motion.div>

          <motion.div
            className="mt-14 flex flex-col items-center"
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={{
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {workflowSteps.map((step, i) => (
              <motion.div
                key={step}
                className="flex flex-col items-center"
                variants={fade}
                transition={spring}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-xs font-bold text-red-600">
                    {i + 1}
                  </div>
                  <span className="w-32 text-sm font-medium text-gray-600">
                    {step}
                  </span>
                </div>
                {i < workflowSteps.length - 1 && (
                  <div className="my-2 h-6 w-px bg-red-200" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Enterprise Security ─────────────────────────────── */}
      <section className="border-t border-gray-100 bg-gray-50/50 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={fade}
            transition={spring}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-red-600">
              Security
            </span>
            <h2 className="mt-3 text-2xl font-bold text-gray-600 sm:text-3xl">
              Enterprise Security
            </h2>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={{
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {securityFeatures.map((f) => (
              <motion.div
                key={f.title}
                className="rounded-xl border border-gray-100 bg-white p-5"
                variants={fade}
                transition={spring}
              >
                <f.icon className="size-5 text-red-600" />
                <h3 className="mt-3 text-sm font-semibold text-gray-600">
                  {f.title}
                </h3>
                <p className="mt-1 text-xs text-gray-400">{f.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Multiple Projects ──────────────────────────────── */}
      <section className="border-t border-gray-100 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={fade}
            transition={spring}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-red-600">
              Scale
            </span>
            <h2 className="mt-3 text-2xl font-bold text-gray-600 sm:text-3xl">
              Unlimited Projects
            </h2>
            <p className="mt-3 text-gray-400">
              Create and manage multiple software projects in one workspace
            </p>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-3 sm:grid-cols-3 lg:grid-cols-4"
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={{
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {projectExamples.map((p) => (
              <motion.div
                key={p}
                className="rounded-xl border border-gray-100 bg-white p-4"
                variants={fade}
                transition={spring}
              >
                <div className="size-2 rounded-full bg-red-400" />
                <p className="mt-3 text-sm font-medium text-gray-600">{p}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Visual project workspace
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Export & Share ──────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-gray-50/50 px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={fade}
            transition={spring}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-red-600">
              Output
            </span>
            <h2 className="mt-3 text-2xl font-bold text-gray-600 sm:text-3xl">
              Export & Share
            </h2>
          </motion.div>

          <motion.div
            className="mt-14 flex flex-wrap justify-center gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            variants={{
              visible: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {exportFeatures.map((f) => (
              <motion.div
                key={f.title}
                className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white px-8 py-5"
                variants={fade}
                transition={spring}
              >
                <f.icon className="size-5 text-red-600" />
                <span className="text-xs font-medium text-gray-500">
                  {f.title}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-red-50 px-4 py-24">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          variants={fade}
          transition={spring}
        >
          <h2 className="text-2xl font-bold text-gray-600 sm:text-3xl">
            Start Designing
          </h2>
          <p className="mt-4 text-gray-400">
            Ready to design your next project visually?
          </p>
          <Link
            href="/auth/sign-in"
            className="mt-8 inline-block rounded-lg bg-red-600 px-8 py-3 text-sm font-semibold text-white"
          >
            Get Started
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Diamond className="size-4 text-red-600" />
            <span className="text-xs font-medium text-gray-400">
              Visual Engineering Studio
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-red-600">
              Enterprise
            </span>
          </div>
          <span className="text-xs text-gray-400">
            Enterprise Visual Engineering Platform
          </span>
        </div>
      </footer>
    </div>
  )
}
