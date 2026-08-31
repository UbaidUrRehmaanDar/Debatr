"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, FileText, MessageSquare, Zap, BookOpen, Globe, Edit, Trash2 } from "lucide-react"
import { api } from "@/lib/trpc-client"

const CATEGORY_ICONS: Record<string, any> = {
  philosophy: BookOpen,
  politics: Globe,
  technology: Zap,
  science: FileText,
  ethics: MessageSquare,
  education: BookOpen,
  economics: Globe,
  culture: MessageSquare,
  other: FileText,
}

const CATEGORY_COLORS: Record<string, string> = {
  philosophy: "#7C3AED",
  politics: "#DC2626",
  technology: "#1E40AF",
  science: "#059669",
  ethics: "#065F46",
  education: "#7C2D12",
  economics: "#B45309",
  culture: "#BE185D",
  other: "#4B5563",
}

export function TemplatesClient() {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    description: "",
    category: "other" as const,
    maxRounds: 4,
    roundDurationMs: 300000,
    maxCharactersPerTurn: 2000,
  })

  const { data: templates, isLoading } = api.templates.list.useQuery()
  const { data: session } = api.me.useQuery()
  const isAdmin = session?.role === "admin"

  const createTemplate = api.templates.create.useMutation({
    onSuccess: () => {
      setShowCreateForm(false)
      setFormData({
        name: "",
        topic: "",
        description: "",
        category: "other",
        maxRounds: 4,
        roundDurationMs: 300000,
        maxCharactersPerTurn: 2000,
      })
    },
  })

  const updateTemplate = api.templates.update.useMutation({
    onSuccess: () => {
      setEditingTemplate(null)
    },
  })

  const deleteTemplate = api.templates.delete.useMutation({
    onSuccess: () => {
      setEditingTemplate(null)
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    createTemplate.mutate(formData)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTemplate) {
      updateTemplate.mutate({
        templateId: editingTemplate,
        ...formData,
      })
    }
  }

  const handleEdit = (template: any) => {
    setEditingTemplate(template.id)
    setFormData({
      name: template.name,
      topic: template.topic,
      description: template.description || "",
      category: template.category,
      maxRounds: template.maxRounds,
      roundDurationMs: template.roundDurationMs,
      maxCharactersPerTurn: template.maxCharactersPerTurn,
    })
  }

  const handleDelete = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplate.mutate({ templateId })
    }
  }

  const handleUseTemplate = (template: any) => {
    router.push(`/debates/new?template=${template.id}`)
  }

  if (isLoading) {
    return (
      <div className="empty-state" style={{ paddingBlock: 64 }}>
        <div className="spinner" />
        <div className="empty-state-title" style={{ marginTop: 16 }}>Loading Templates</div>
      </div>
    )
  }

  return (
    <>
      {/* Create/Edit Form */}
      {(showCreateForm || editingTemplate) && isAdmin && (
        <div className="card" style={{ padding: "24px", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16 }}>
            {editingTemplate ? "Edit Template" : "Create New Template"}
          </h2>
          <form onSubmit={editingTemplate ? handleUpdate : handleCreate}>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label className="form-label">Template Name</label>
                <input
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Climate Policy Debate"
                />
              </div>
              <div>
                <label className="form-label">Topic/Resolution</label>
                <input
                  className="form-input"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  required
                  placeholder="e.g., Should governments implement carbon taxes?"
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the debate topic..."
                  rows={2}
                />
              </div>
              <div>
                <label className="form-label">Category</label>
                <select
                  className="form-input form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                >
                  <option value="philosophy">Philosophy</option>
                  <option value="politics">Politics</option>
                  <option value="technology">Technology</option>
                  <option value="science">Science</option>
                  <option value="ethics">Ethics</option>
                  <option value="education">Education</option>
                  <option value="economics">Economics</option>
                  <option value="culture">Culture</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <div>
                  <label className="form-label">Rounds</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.maxRounds}
                    onChange={(e) => setFormData({ ...formData, maxRounds: parseInt(e.target.value) })}
                    min={1}
                    max={20}
                  />
                </div>
                <div>
                  <label className="form-label">Duration (min)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.roundDurationMs / 60000}
                    onChange={(e) => setFormData({ ...formData, roundDurationMs: parseInt(e.target.value) * 60000 })}
                    min={1}
                    max={30}
                  />
                </div>
                <div>
                  <label className="form-label">Characters</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.maxCharactersPerTurn}
                    onChange={(e) => setFormData({ ...formData, maxCharactersPerTurn: parseInt(e.target.value) })}
                    min={100}
                    max={10000}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createTemplate.isPending || updateTemplate.isPending}
                >
                  {createTemplate.isPending || updateTemplate.isPending ? "Saving..." : editingTemplate ? "Update Template" : "Create Template"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingTemplate(null)
                    setFormData({
                      name: "",
                      topic: "",
                      description: "",
                      category: "other",
                      maxRounds: 4,
                      roundDurationMs: 300000,
                      maxCharactersPerTurn: 2000,
                    })
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Header Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        {isAdmin && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={16} />
            Create Template
          </button>
        )}
      </div>

      {/* Templates Grid */}
      {templates && templates.length > 0 ? (
        <div className="templates-grid">
          {templates.map((template) => {
            const Icon = CATEGORY_ICONS[template.category] || FileText
            const color = CATEGORY_COLORS[template.category] || "#4B5563"
            const isEditing = editingTemplate === template.id

            return (
              <div key={template.id} className="template-card" style={{ position: "relative" }}>
                {template.isDefault && (
                  <div style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "rgba(98,174,240,0.1)",
                    color: "var(--notion-accent-sky)",
                    fontSize: 10,
                    fontWeight: 500,
                    padding: "2px 6px",
                    borderRadius: "var(--radius-xs)",
                  }}>
                    Default
                  </div>
                )}
                <div className="template-card-header">
                  <div
                    className="template-icon"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="template-card-name">{template.name}</span>
                </div>
                <div className="template-card-desc">{template.topic}</div>
                {template.description && (
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 8, lineHeight: 1.4 }}>
                    {template.description}
                  </div>
                )}
                <div style={{ 
                  fontSize: 11, 
                  color: "var(--muted-foreground)", 
                  marginTop: 12,
                  display: "flex",
                  gap: 12,
                }}>
                  <span>{template.maxRounds} rounds</span>
                  <span>•</span>
                  <span>{Math.round(template.roundDurationMs / 60000)} min/turn</span>
                  <span>•</span>
                  <span>{template.maxCharactersPerTurn} chars</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button 
                    className="template-use-btn"
                    onClick={() => handleUseTemplate(template)}
                    style={{ flex: 1 }}
                  >
                    Use Template
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEdit(template)}
                        style={{ padding: "8px 12px" }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDelete(template.id)}
                        style={{ padding: "8px 12px", color: "var(--destructive)" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state" style={{ paddingBlock: 64 }}>
          <div className="empty-state-icon">
            <FileText size={22} strokeWidth={1.5} />
          </div>
          <div className="empty-state-title">No templates yet</div>
          <p className="empty-state-desc">
            {isAdmin 
              ? "Create your first debate template to quickly start structured debates." 
              : "No templates are available yet. Ask an administrator to create some."}
          </p>
          {isAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
              style={{ marginTop: 16 }}
            >
              <Plus size={16} style={{ marginRight: 8 }} />
              Create First Template
            </button>
          )}
        </div>
      )}
    </>
  )
}