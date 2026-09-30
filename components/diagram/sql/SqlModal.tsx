'use client'

import React, { useState } from 'react'
import {
  X,
  Database,
  Copy,
  Check,
  Download,
  Upload,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react'
import {
  generateSqlFromErd,
  parseSqlToErd,
  validateErdSchema,
  type ErdTableNode,
  type ErdLink,
} from './sqlParser'

interface SqlModalProps {
  isOpen: boolean
  onClose: () => void
  tables: ErdTableNode[]
  links: ErdLink[]
  onImportErd: (imported: { nodes: ErdTableNode[]; links: ErdLink[] }) => void
}

export function SqlModal({
  isOpen,
  onClose,
  tables,
  links,
  onImportErd,
}: SqlModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'validate'>('export')
  const [dialect, setDialect] = useState<'postgres' | 'mysql' | 'sqlite'>('postgres')
  const [copied, setCopied] = useState(false)
  const [sqlInput, setSqlInput] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)

  if (!isOpen) return null

  const generatedSql = generateSqlFromErd(tables, links, dialect)
  const validationIssues = validateErdSchema(tables, links)

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([generatedSql], { type: 'text/sql' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `schema_${dialect}_${Date.now()}.sql`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    setImportError(null)
    setImportSuccess(null)

    if (!sqlInput.trim()) {
      setImportError('Please enter valid SQL CREATE TABLE statements.')
      return
    }

    try {
      const result = parseSqlToErd(sqlInput)
      if (result.nodes.length === 0) {
        setImportError('No valid CREATE TABLE statements could be found.')
        return
      }

      onImportErd(result)
      setImportSuccess(`Successfully imported ${result.nodes.length} tables and ${result.links.length} relationships!`)
      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : 'Failed to parse SQL statements.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Database className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Database SQL Tools</h2>
              <p className="text-xs text-gray-500">
                Generate DDL schemas, import existing tables, or validate relationships
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 px-6 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-1.5 py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'export'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Download className="size-3.5" />
            <span>Export DDL SQL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-1.5 py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'import'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Upload className="size-3.5" />
            <span>Import SQL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('validate')}
            className={`flex items-center gap-1.5 py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'validate'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <AlertTriangle className="size-3.5" />
            <span>Schema Validation ({validationIssues.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-gray-700">SQL Dialect:</label>
                  <select
                    value={dialect}
                    onChange={(e) =>
                      setDialect(e.target.value as 'postgres' | 'mysql' | 'sqlite')
                    }
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
                  >
                    <option value="postgres">PostgreSQL</option>
                    <option value="mysql">MySQL / MariaDB</option>
                    <option value="sqlite">SQLite</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
                  >
                    {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Download className="size-3.5" />
                    <span>Download .sql</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-xl border border-gray-200 bg-slate-900 p-4 overflow-x-auto max-h-72">
                <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre">
                  {generatedSql}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                Paste SQL <code className="bg-gray-100 px-1 py-0.5 rounded text-blue-600">CREATE TABLE</code> statements to automatically generate tables and columns on the canvas:
              </p>

              <textarea
                rows={8}
                value={sqlInput}
                onChange={(e) => setSqlInput(e.target.value)}
                placeholder={`CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  username VARCHAR(100),\n  email VARCHAR(100)\n);\n\nCREATE TABLE orders (\n  id SERIAL PRIMARY KEY,\n  user_id INT REFERENCES users(id),\n  amount DECIMAL(10,2)\n);`}
                className="w-full rounded-xl border border-gray-300 p-3 font-mono text-xs text-gray-800 focus:border-blue-600 focus:outline-none"
              />

              {importError && (
                <div className="flex items-center gap-2 text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <Check className="size-4 shrink-0" />
                  <span>{importSuccess}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleImport}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-md transition cursor-pointer"
                >
                  <Upload className="size-4" />
                  <span>Import Tables to Canvas</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'validate' && (
            <div className="space-y-3">
              {validationIssues.length === 0 ? (
                <div className="text-center py-8">
                  <div className="size-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <Check className="size-5" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800">Schema is Healthy</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    All tables have primary keys, unique column names, and relationships.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {validationIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${
                        issue.type === 'error'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      {issue.type === 'error' ? (
                        <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold uppercase tracking-wider text-[10px]">
                          {issue.type}
                        </div>
                        <div>{issue.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
