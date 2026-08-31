"use client"

import { Plus, FileText, MessageSquare, Zap, BookOpen, Globe } from "lucide-react"

export function TemplatesClient() {
  const templates = [
    {
      id: 1,
      name: "Policy Debate",
      desc: "Standard format with constructive speeches, rebuttals, and cross-examination periods.",
      icon: FileText,
      color: "#065F46",
    },
    {
      id: 2,
      name: "Lincoln-Douglas",
      desc: "One-on-one debate focusing on values and philosophy rather than policy.",
      icon: MessageSquare,
      color: "#059669",
    },
    {
      id: 3,
      name: "Parliamentary",
      desc: "Impromptu debate with limited preparation time and formal parliamentary procedures.",
      icon: Zap,
      color: "#1E40AF",
    },
    {
      id: 4,
      name: "Public Forum",
      desc: "Team debate accessible to general audiences with balanced arguments.",
      icon: Globe,
      color: "#7C3AED",
    },
    {
      id: 5,
      name: "Karl Popper",
      desc: "Modified format emphasizing teamwork and research skills.",
      icon: BookOpen,
      color: "#DC2626",
    },
  ]

  return (
    <>
      <div className="templates-grid">
        {templates.map((template) => (
          <div key={template.id} className="template-card">
            <div className="template-card-header">
              <div
                className="template-icon"
                style={{ backgroundColor: `${template.color}20`, color: template.color }}
              >
                <template.icon size={20} />
              </div>
              <span className="template-card-name">{template.name}</span>
            </div>
            <div className="template-card-desc">{template.desc}</div>
            <button className="template-use-btn">Use Template</button>
          </div>
        ))}
      </div>
    </>
  )
}
