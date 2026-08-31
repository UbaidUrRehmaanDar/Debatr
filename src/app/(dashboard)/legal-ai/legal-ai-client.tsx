"use client"

import { useState } from "react"
import { Upload, ChevronDown, MessageSquare } from "lucide-react"

const ScaleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
)

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
)

export function LegalAIClient() {
  const [message, setMessage] = useState("")

  const suggestions = [
    "What legal precedents support AI regulation?",
    "How do I argue drug decriminalization?",
    "Walk me through climate liability law.",
  ]

  return (
    <div className="lawyer-empty">
      <div className="lawyer-empty-inner">
        <div className="lawyer-avatar">
          <ScaleIcon />
        </div>
        <p className="lawyer-subheading">
          Ask me anything about law — case precedents, statutory frameworks, or debate arguments.
        </p>

        <div className="suggested-questions">
          {suggestions.map((question) => (
            <button
              key={question}
              className="suggested-question"
              type="button"
              onClick={() => setMessage(question)}
            >
              {question}
            </button>
          ))}
        </div>

        <div className="chat-input-box" style={{ width: "100%", maxWidth: 680 }}>
          <div style={{ padding: "12px 14px 0" }}>
            <textarea
              className="chat-textarea"
              rows={1}
              placeholder="Ask anything about law…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="chat-toolbar">
            <div className="chat-toolbar-left">
              <button className="chat-attach-btn" type="button">
                <Upload size={16} strokeWidth={1.5} />
              </button>
              <button className="chat-context-btn" type="button">
                <MessageSquare size={13} strokeWidth={1.5} style={{ marginRight: 5 }} />
                Context
                <ChevronDown size={10} strokeWidth={1.75} />
              </button>
            </div>
            <button
              className="chat-send-btn disabled"
              type="button"
              disabled={!message.trim()}
            >
              <SendIcon />
            </button>
          </div>
        </div>
        <p className="chat-disclaimer">
          For research and argument support only — not legal advice.
        </p>
      </div>
    </div>
  )
}
