"use client"

import { useState } from "react"
import { Upload, ChevronDown, MessageSquare, Loader2, BookOpen, Scale } from "lucide-react"
import { api } from "@/lib/trpc-client"

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

interface Message {
  role: "user" | "assistant"
  content: string
  response?: {
    answer: string
    reasoning: string
    relevantCases: Array<{ name: string; citation: string; relevance: string; year: number }>
    statutes: Array<{ name: string; citation: string; relevance: string }>
    confidence: number
    disclaimer: string
  }
  tokensUsed?: number
}

export function LegalAIClient() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [jurisdiction, setJurisdiction] = useState("")
  const [areaOfLaw, setAreaOfLaw] = useState("")

  const suggestions = [
    "What legal precedents support AI regulation?",
    "How do I argue drug decriminalization?",
    "Walk me through climate liability law.",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    const userMessage: Message = {
      role: "user",
      content: message,
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsLoading(true)

    try {
      const result = await api.legalAi.query.mutate({
        question: userMessage.content,
        jurisdiction: jurisdiction || undefined,
        areaOfLaw: areaOfLaw || undefined,
      })

      const assistantMessage: Message = {
        role: "assistant",
        content: result.response.answer,
        response: result.response,
        tokensUsed: result.tokensUsed,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Legal AI query failed:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I encountered an error processing your legal query. Please try again.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestion = (question: string) => {
    setMessage(question)
  }

  if (messages.length > 0) {
    return (
      <div className="legal-ai-chat">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === "assistant" ? <ScaleIcon /> : <div className="user-avatar">U</div>}
              </div>
              <div className="message-content">
                <div className="message-text">{msg.content}</div>
                {msg.response && (
                  <div className="legal-response">
                    {msg.response.reasoning && (
                      <div className="legal-section">
                        <h4>Legal Reasoning</h4>
                        <p>{msg.response.reasoning}</p>
                      </div>
                    )}
                    {msg.response.relevantCases && msg.response.relevantCases.length > 0 && (
                      <div className="legal-section">
                        <h4>Relevant Cases</h4>
                        {msg.response.relevantCases.map((case_, idx) => (
                          <div key={idx} className="legal-case">
                            <div className="case-header">
                              <BookOpen size={14} />
                              <span className="case-name">{case_.name}</span>
                              <span className="case-year">{case_.year}</span>
                            </div>
                            <div className="case-citation">{case_.citation}</div>
                            <div className="case-relevance">{case_.relevance}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.response.statutes && msg.response.statutes.length > 0 && (
                      <div className="legal-section">
                        <h4>Relevant Statutes</h4>
                        {msg.response.statutes.map((statute, idx) => (
                          <div key={idx} className="legal-statute">
                            <div className="statute-name">{statute.name}</div>
                            <div className="statute-citation">{statute.citation}</div>
                            <div className="statute-relevance">{statute.relevance}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.response.disclaimer && (
                      <div className="legal-disclaimer">{msg.response.disclaimer}</div>
                    )}
                    {msg.tokensUsed && (
                      <div className="token-usage">Tokens used: {msg.tokensUsed}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message assistant">
              <div className="message-avatar">
                <ScaleIcon />
              </div>
              <div className="message-content">
                <div className="loading-indicator">
                  <Loader2 size={16} className="spinner" />
                  <span>Analyzing legal question...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="chat-input-box">
            <textarea
              className="chat-textarea"
              rows={1}
              placeholder="Ask a legal question…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!message.trim() || isLoading}
            >
              {isLoading ? <Loader2 size={14} className="spinner" /> : <SendIcon />}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="lawyer-empty">
      <div className="lawyer-empty-inner">
        <div className="lawyer-avatar">
          <ScaleIcon />
        </div>
        <p className="lawyer-subheading">
          Ask me anything about law — case precedents, statutory frameworks, or debate arguments.
        </p>

        <div className="legal-context-options">
          <input
            type="text"
            className="context-input"
            placeholder="Jurisdiction (e.g., US, UK, EU)"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
          />
          <input
            type="text"
            className="context-input"
            placeholder="Area of law (e.g., Constitutional, Criminal)"
            value={areaOfLaw}
            onChange={(e) => setAreaOfLaw(e.target.value)}
          />
        </div>

        <div className="suggested-questions">
          {suggestions.map((question) => (
            <button
              key={question}
              className="suggested-question"
              type="button"
              onClick={() => handleSuggestion(question)}
            >
              {question}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="chat-input-box" style={{ width: "100%", maxWidth: 680 }}>
          <div style={{ padding: "12px 14px 0" }}>
            <textarea
              className="chat-textarea"
              rows={1}
              placeholder="Ask anything about law…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
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
              className="chat-send-btn"
              type="submit"
              disabled={!message.trim() || isLoading}
            >
              {isLoading ? <Loader2 size={14} className="spinner" /> : <SendIcon />}
            </button>
          </div>
        </form>
        <p className="chat-disclaimer">
          For research and argument support only — not legal advice.
        </p>
      </div>
    </div>
  )
}
