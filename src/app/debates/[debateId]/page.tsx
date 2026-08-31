"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { api } from "@/lib/trpc-client"

const SIDE_COLORS: Record<string, string> = {
  affirmative: "var(--notion-accent-sky)",
  negative: "var(--notion-accent-orange)",
}

const SIDE_BG: Record<string, string> = {
  affirmative: "rgba(98,174,240,0.08)",
  negative: "rgba(221,91,0,0.08)",
}

export default function DebateDetailPage() {
  const params = useParams()
  const { data: session } = useSession()
  const debateId = typeof params.debateId === "string" ? params.debateId : params.debateId?.[0]
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "reconnecting">("connected")

  const { data: debate, isLoading, error, refetch } = api.debates.get.useQuery(
    { debateId: debateId ?? "" },
    { enabled: !!debateId }
  )

  const postMessage = api.debates.postMessage.useMutation({
    onSuccess: () => { setMessage(""); refetch() },
    onError: (err) => console.error("Failed to post message:", err),
  })

  const joinDebate = api.debates.join.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => console.error("Failed to join debate:", err),
  })

  const enterJudging = api.debates.enterJudging.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => console.error("Failed to enter judging:", err),
  })

  const requestLawyer = api.debates.requestLawyer.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => console.error("Failed to request lawyer:", err),
  })

  const generateJudgeReport = api.debates.generateJudgeReport.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => console.error("Failed to generate judge report:", err),
  })

  const pauseDebate = api.debates.pause.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => console.error("Failed to pause debate:", err),
  })

  const resumeDebate = api.debates.resume.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => console.error("Failed to resume debate:", err),
  })

  const raiseHand = api.debates.raiseHand.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => console.error("Failed to raise hand:", err),
  })

  const decideRaiseHand = api.debates.decideRaiseHand.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => console.error("Failed to decide raise hand:", err),
  })

  const factCheckMessage = api.debates.factCheckMessage.useMutation({
    onSuccess: (data, variables) => {
      setFactCheckResults(prev => ({
        ...prev,
        [variables.messageId]: data
      }))
      setFactCheckErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[variables.messageId]
        return newErrors
      })
      refetch()
    },
    onError: (err: any, variables) => {
      console.error("Failed to fact-check message:", err)
      setFactCheckErrors(prev => ({
        ...prev,
        [variables.messageId]: err.message || "Failed to fact-check. Please try again."
      }))
    },
  })

  const pinEvidence = api.evidence.pin.useMutation({
    onSuccess: () => {
      setEvidenceClaim("")
      setEvidenceSource("")
      refetch()
    },
    onError: (err) => {
      console.error("Failed to pin evidence:", err)
    },
  })

  const removeEvidence = api.evidence.remove.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => console.error("Failed to remove evidence:", err),
  })

  const exportDebate = api.exports.exportDebate.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `debate-${debateId}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    onError: (err) => console.error("Failed to export debate:", err),
  })

  const [lawyerRequest, setLawyerRequest] = useState("")
  const [showLawyerPanel, setShowLawyerPanel] = useState(false)
  const [lawyerResponse, setLawyerResponse] = useState("")
  const [lawyerError, setLawyerError] = useState("")
  const [factCheckResults, setFactCheckResults] = useState<Record<string, any>>({})
  const [factCheckErrors, setFactCheckErrors] = useState<Record<string, string>>({})
  const [showEvidencePanel, setShowEvidencePanel] = useState(false)
  const [evidenceClaim, setEvidenceClaim] = useState("")
  const [evidenceSource, setEvidenceSource] = useState("")
  const [evidenceSide, setEvidenceSide] = useState<"affirmative" | "negative" | "neutral">("neutral")

  async function handlePostMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || !debateId) return
    setIsSubmitting(true)
    try {
      await postMessage.mutateAsync({ debateId, content: message.trim() })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLawyerRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!lawyerRequest.trim() || !debateId) return
    setLawyerError("")
    try {
      const result = await requestLawyer.mutateAsync({ debateId, request: lawyerRequest.trim() })
      setLawyerResponse(result.advice || "Advice received")
      setLawyerRequest("")
    } catch (err: any) {
      console.error("Failed to request lawyer:", err)
      setLawyerError(err.message || "Failed to get advice. Please try again.")
    }
  }

  if (!debateId || error || (!isLoading && !debate)) {
    return (
      <main className="page-content page-enter">
        <div className="empty-state" style={{ paddingBlock: 64 }}>
          <div className="empty-state-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4"/><path d="M12 16h.01"/>
            </svg>
          </div>
          <div className="empty-state-title">
            {!debateId ? "Invalid Debate ID" : error ? "Error Loading Debate" : "Debate Not Found"}
          </div>
          <p className="empty-state-desc">
            {!debateId ? "The debate ID provided is invalid." : error ? "There was an error loading this debate. Please try again." : "This debate may have been deleted or you don't have access to it."}
          </p>
          <Link href="/debates" className="btn btn-primary">
            Back to Debates
          </Link>
        </div>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="page-content page-enter">
        <div className="empty-state" style={{ paddingBlock: 64 }}>
          <div className="spinner" />
          <div className="empty-state-title" style={{ marginTop: 16 }}>Loading Debate</div>
          <p className="empty-state-desc">Please wait while we load the debate data...</p>
        </div>
      </main>
    )
  }

  const activeTurn = debate!.turns.find((t: { status: string }) => t.status === "active")
  const currentUserParticipant = debate!.participants.find((p: { user: { id: string } }) => p.user.id === session?.user?.id)
  const isUsersTurn = activeTurn?.participantId === currentUserParticipant?.id

  // Timer countdown logic
  useEffect(() => {
    if (!activeTurn || debate!.status !== "active") {
      setTimeRemaining(0)
      return
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime()
      const startTime = new Date(activeTurn.startTime).getTime()
      const duration = debate!.roundDurationMs
      const elapsed = now - startTime
      const remaining = Math.max(0, duration - elapsed)
      return remaining
    }

    setTimeRemaining(calculateTimeRemaining())

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining()
      setTimeRemaining(remaining)
      
      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [activeTurn, debate!.status, debate!.roundDurationMs])

  // Format time as MM:SS
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const statusLabel = {
    active: "Active",
    waiting_for_participants: "Waiting",
    judging: "Judging",
    completed: "Completed",
  }[debate!.status as string] ?? debate!.status

  return (
    <main className="page-content page-enter">
      {/* Back + Title */}
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/debates"
          style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--muted-foreground)", marginBottom: 12 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Debates
        </Link>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 500, letterSpacing: "-0.025em", color: "var(--foreground)", marginBottom: 6 }}>
              {debate!.topic}
            </h1>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span className={`badge ${debate!.status === "active" ? "badge-success" : debate!.status === "completed" ? "badge-neutral" : "badge-info"}`}>
                {statusLabel}
              </span>
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Round - / {debate!.maxRounds} - {debate!.participants.length} participants
              </span>
            </div>
          </div>
          {debate!.status === "active" && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => pauseDebate.mutate({ debateId: debateId ?? "" })}
                disabled={pauseDebate.isPending}
              >
                {pauseDebate.isPending ? "Pausing..." : "Pause"}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => enterJudging.mutate({ debateId: debateId ?? "" })}
                disabled={enterJudging.isPending}
              >
                {enterJudging.isPending ? "Ending..." : "End Debate"}
              </button>
            </div>
          )}
          {debate!.status === "paused" && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => resumeDebate.mutate({ debateId: debateId ?? "" })}
              disabled={resumeDebate.isPending}
            >
              {resumeDebate.isPending ? "Resuming..." : "Resume"}
            </button>
          )}
          {debate!.status === "judging" && !debate!.judgeReport && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => generateJudgeReport.mutate({ debateId: debateId ?? "" })}
              disabled={generateJudgeReport.isPending}
            >
              {generateJudgeReport.isPending ? "⏳ Judging (this may take a minute)..." : "Run Judge"}
            </button>
          )}
          {debate!.status === "judging" && generateJudgeReport.isPending && (
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>
              AI is analyzing the debate transcript...
            </div>
          )}
          {debate!.status === "completed" && debate!.judgeReport && (
            <Link
              href={`/debates/${debateId}/report`}
              className="btn btn-primary btn-sm"
            >
              View Report
            </Link>
          )}
          {debate!.status === "waiting_for_participants" && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => joinDebate.mutate({ debateId: debateId ?? "" })}
              disabled={joinDebate.isPending}
            >
              {joinDebate.isPending ? "Joining..." : "Join Debate"}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 280px" }}>
        {/* Main: Transcript */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Participants */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {debate!.participants.map((p: { id: string; side: string; displayName: string }) => (
              <div
                key={p.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius-lg)",
                  border: `1px solid ${SIDE_COLORS[p.side] ?? "var(--border)"}22`,
                  background: SIDE_BG[p.side] ?? "var(--muted)",
                }}
              >
                <span
                  className="badge"
                  style={{
                    background: `${SIDE_COLORS[p.side]}18`,
                    color: SIDE_COLORS[p.side] ?? "var(--foreground)",
                    marginBottom: 6,
                  }}
                >
                  {p.side.charAt(0).toUpperCase() + p.side.slice(1)}
                </span>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--foreground)" }}>
                  {p.displayName}
                </div>
              </div>
            ))}
          </div>

          {/* Messages */}
          <div>
            <div className="section-header" style={{ marginBottom: 12 }}>
              <span className="section-title">Transcript</span>
              <span className="section-line" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {debate!.messages.length === 0 ? (
                <div className="empty-state" style={{ paddingBlock: 40 }}>
                  <div className="empty-state-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <div className="empty-state-title">No messages yet</div>
                  <p className="empty-state-desc">
                    {debate!.status === "waiting_for_participants" 
                      ? "Waiting for both participants to join the debate." 
                      : debate!.status === "active" 
                        ? "The debate hasn't started yet. Be the first to speak!" 
                        : "No messages in this debate."}
                  </p>
                </div>
              ) : (
                debate!.messages.map((msg: { id: string; side: string; sender: { name: string | null }; content: string }) => (
                  <div
                    key={msg.id}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "var(--radius-lg)",
                      background: SIDE_BG[msg.side] ?? "var(--muted)",
                      borderLeft: `3px solid ${SIDE_COLORS[msg.side] ?? "var(--border)"}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span
                        className="badge"
                        style={{
                          background: `${SIDE_COLORS[msg.side]}18`,
                          color: SIDE_COLORS[msg.side] ?? "var(--foreground)",
                        }}
                      >
                        {msg.side.charAt(0).toUpperCase() + msg.side.slice(1)}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 500 }}>
                        {msg.sender.name}
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => factCheckMessage.mutate({ debateId: debateId ?? "", messageId: msg.id })}
                        disabled={factCheckMessage.isPending}
                        style={{ marginLeft: "auto", fontSize: 11, padding: "4px 8px" }}
                      >
                        {factCheckMessage.isPending ? "Checking..." : "🔍 Fact Check"}
                      </button>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--foreground)", lineHeight: 1.65 }}>
                      {msg.content}
                    </p>
                    {factCheckResults[msg.id] && (
                      <div style={{
                        marginTop: 12,
                        padding: "10px 12px",
                        borderRadius: "var(--radius-md)",
                        background: "rgba(98,174,240,0.08)",
                        border: "1px solid rgba(98,174,240,0.2)",
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--notion-accent-sky)", marginBottom: 6 }}>
                          Fact Check Result
                        </div>
                        <div style={{ fontSize: 12, color: "var(--foreground)" }}>
                          <strong>Verdict:</strong> {factCheckResults[msg.id].verdict || "Pending"}
                        </div>
                        {factCheckResults[msg.id].confidence && (
                          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                            <strong>Confidence:</strong> {(factCheckResults[msg.id].confidence * 100).toFixed(0)}%
                          </div>
                        )}
                        {factCheckResults[msg.id].reasoning && (
                          <div style={{ fontSize: 12, color: "var(--foreground)", marginTop: 4, lineHeight: 1.4 }}>
                            {factCheckResults[msg.id].reasoning}
                          </div>
                        )}
                      </div>
                    )}
                    {factCheckErrors[msg.id] && (
                      <div style={{
                        marginTop: 12,
                        padding: "10px 12px",
                        borderRadius: "var(--radius-md)",
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                      }}>
                        <div style={{ fontSize: 12, color: "var(--destructive)" }}>
                          {factCheckErrors[msg.id]}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Debate Status Info */}
          {debate!.status === "waiting_for_participants" && (
            <div className="card" style={{ padding: "16px", background: "rgba(98,174,240,0.08)", border: "1px solid rgba(98,174,240,0.2)" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--notion-accent-sky)", marginBottom: 8 }}>
                ⏳ Waiting for Participants
              </div>
              <p style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.5 }}>
                Both participants need to join before the debate can begin. Share the debate link with your opponent to get started.
              </p>
            </div>
          )}

          {debate!.status === "paused" && (
            <div className="card" style={{ padding: "16px", background: "rgba(221,91,0,0.08)", border: "1px solid rgba(221,91,0,0.2)" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--notion-accent-orange)", marginBottom: 8 }}>
                ⏸️ Debate Paused
              </div>
              <p style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.5 }}>
                The debate has been paused. A participant can resume it when ready to continue.
              </p>
            </div>
          )}

          {debate!.status === "judging" && !debate!.judgeReport && (
            <div className="card" style={{ padding: "16px", background: "rgba(214,182,246,0.08)", border: "1px solid rgba(214,182,246,0.2)" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--notion-accent-purple)", marginBottom: 8 }}>
                ⚖️ Awaiting Judge Report
              </div>
              <p style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.5 }}>
                The debate has concluded and is being evaluated by the AI Judge. This may take a few minutes.
              </p>
            </div>
          )}

          {/* Compose */}
          {debate!.status === "active" && (
            <div>
              <div className="section-header" style={{ marginBottom: 12 }}>
                <span className="section-title">Your Turn</span>
                <span className="section-line" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => raiseHand.mutate({ debateId: debateId ?? "" })}
                  disabled={raiseHand.isPending}
                  style={{ fontSize: 12 }}
                >
                  {raiseHand.isPending ? "Raising..." : "🙋 Raise Hand (Point of Order)"}
                </button>
              </div>
              <form onSubmit={handlePostMessage}>
                <div className={`chat-input-box${message ? " focused" : ""}`}>
                  <textarea
                    className="chat-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={debate!.maxCharactersPerTurn}
                    placeholder={isUsersTurn ? "Type your argument..." : "Waiting for opponent..."}
                    disabled={!isUsersTurn}
                    rows={4}
                  />
                  <div className="chat-toolbar">
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                      {message.length} / {debate!.maxCharactersPerTurn}
                    </span>
                    <button
                      type="submit"
                      disabled={!isUsersTurn || !message.trim() || isSubmitting}
                      className="chat-send-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m22 2-7 20-4-9-9-4Z"/>
                        <path d="M22 2 11 13"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Lawyer Panel Toggle */}
          {debate!.status === "active" && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowLawyerPanel(!showLawyerPanel)}
              style={{ width: "100%" }}
            >
              {showLawyerPanel ? "Hide Lawyer" : "Ask AI Lawyer"}
            </button>
          )}

          {/* Evidence Panel Toggle */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowEvidencePanel(!showEvidencePanel)}
            style={{ width: "100%" }}
          >
            {showEvidencePanel ? "Hide Evidence" : "📌 Evidence"}
          </button>

          {/* Lawyer Panel */}
          {showLawyerPanel && debate!.status === "active" && (
            <div className="card" style={{ padding: "16px" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>
                AI Lawyer (Private)
              </div>
              <form onSubmit={handleLawyerRequest}>
                <textarea
                  value={lawyerRequest}
                  onChange={(e) => setLawyerRequest(e.target.value)}
                  placeholder="Ask for coaching, argument help, or strategy..."
                  disabled={requestLawyer.isPending}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    color: "var(--foreground)",
                    fontSize: 13,
                    resize: "vertical",
                    marginBottom: 8,
                  }}
                />
                <button
                  type="submit"
                  disabled={!lawyerRequest.trim() || requestLawyer.isPending}
                  className="btn btn-primary btn-sm"
                  style={{ width: "100%" }}
                >
                  {requestLawyer.isPending ? "Asking..." : "Get Advice"}
                </button>
              </form>
              {lawyerResponse && (
                <div style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(98,174,240,0.08)",
                  border: "1px solid rgba(98,174,240,0.2)",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "var(--notion-accent-sky)", marginBottom: 6 }}>
                    Lawyer Advice
                  </div>
                  <div style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.5 }}>
                    {lawyerResponse}
                  </div>
                </div>
              )}
              {lawyerError && (
                <div style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                }}>
                  <div style={{ fontSize: 12, color: "var(--destructive)" }}>
                    {lawyerError}
                  </div>
                </div>
              )}
              <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 8, lineHeight: 1.4 }}>
                Private coaching for your side only. Not legal advice.
              </p>
            </div>
          )}

          {/* Evidence Panel */}
          {showEvidencePanel && (
            <div className="card" style={{ padding: "16px" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>
                Pinned Evidence
              </div>
              
              {/* Existing Evidence */}
              {debate!.evidence && debate!.evidence.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  {debate!.evidence.map((ev: { id: string; claim: string; source?: string; side: string; pinnedBy: { name: string | null } }) => (
                    <div
                      key={ev.id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "var(--radius-md)",
                        background: "var(--muted)",
                        marginBottom: 8,
                        borderLeft: `3px solid ${ev.side === "affirmative" ? "var(--notion-accent-sky)" : ev.side === "negative" ? "var(--notion-accent-orange)" : "var(--border)"}`,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>
                        {ev.claim}
                      </div>
                      {ev.source && (
                        <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 4 }}>
                          Source: {ev.source}
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                        Pinned by {ev.pinnedBy.name || "Unknown"}
                      </div>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => removeEvidence.mutate({ evidenceId: ev.id })}
                        disabled={removeEvidence.isPending}
                        style={{ fontSize: 10, padding: "2px 6px", marginTop: 6 }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Evidence Form */}
              <form onSubmit={(e) => {
                e.preventDefault()
                if (!evidenceClaim.trim() || !debateId) return
                pinEvidence.mutate({
                  debateId: debateId ?? "",
                  claim: evidenceClaim.trim(),
                  source: evidenceSource.trim() || undefined,
                  side: evidenceSide,
                })
              }}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", marginBottom: 4, display: "block" }}>
                    Claim or Fact
                  </label>
                  <textarea
                    value={evidenceClaim}
                    onChange={(e) => setEvidenceClaim(e.target.value)}
                    placeholder="Enter a claim, fact, or piece of evidence..."
                    disabled={pinEvidence.isPending}
                    rows={2}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      background: "var(--background)",
                      color: "var(--foreground)",
                      fontSize: 12,
                      resize: "vertical",
                    }}
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", marginBottom: 4, display: "block" }}>
                    Source (optional)
                  </label>
                  <input
                    type="text"
                    value={evidenceSource}
                    onChange={(e) => setEvidenceSource(e.target.value)}
                    placeholder="Source URL or citation..."
                    disabled={pinEvidence.isPending}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                      background: "var(--background)",
                      color: "var(--foreground)",
                      fontSize: 12,
                    }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", marginBottom: 4, display: "block" }}>
                    Side
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["neutral", "affirmative", "negative"].map((side) => (
                      <button
                        key={side}
                        type="button"
                        className={`btn btn-sm ${evidenceSide === side ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setEvidenceSide(side as any)}
                        disabled={pinEvidence.isPending}
                        style={{ fontSize: 11, padding: "4px 8px", flex: 1 }}
                      >
                        {side.charAt(0).toUpperCase() + side.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!evidenceClaim.trim() || pinEvidence.isPending}
                  className="btn btn-primary btn-sm"
                  style={{ width: "100%", fontSize: 12 }}
                >
                  {pinEvidence.isPending ? "Pinning..." : "Pin Evidence"}
                </button>
              </form>
            </div>
          )}

          {/* Current turn */}
          {activeTurn && (
            <div className="card" style={{ padding: "16px" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>
                Current Turn
              </div>
              <div style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                Round {activeTurn.roundIndex + 1} of {debate!.maxRounds}
              </div>
              <div style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 500, marginTop: 4, textTransform: "capitalize" }}>
                {activeTurn.side} speaks
              </div>
              
              {/* Timer */}
              {debate!.status === "active" && (
                <div style={{
                  marginTop: 12,
                  padding: "12px",
                  background: timeRemaining < 60000 ? "rgba(221,91,0,0.1)" : "rgba(98,174,240,0.1)",
                  borderRadius: "var(--radius-md)",
                  border: timeRemaining < 60000 ? "1px solid rgba(221,91,0,0.3)" : "1px solid rgba(98,174,240,0.2)",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: timeRemaining < 60000 ? "var(--notion-accent-orange)" : "var(--notion-accent-sky)", marginBottom: 4 }}>
                    Time Remaining
                  </div>
                  <div style={{ 
                    fontSize: 24, 
                    fontWeight: 600, 
                    color: timeRemaining < 60000 ? "var(--notion-accent-orange)" : "var(--foreground)",
                    fontFamily: "monospace",
                  }}>
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              )}
              
              {isUsersTurn && (
                <div style={{
                  marginTop: 12,
                  padding: "8px 12px",
                  background: "rgba(98,174,240,0.1)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                  color: "var(--notion-accent-sky)",
                  fontWeight: 500,
                }}>
                  It&apos;s your turn!
                </div>
              )}
            </div>
          )}

          {/* Raise Hand Requests */}
          {debate!.raiseHandRequests && debate!.raiseHandRequests.length > 0 && (
            <div className="card" style={{ padding: "16px" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>
                Raise Hand Requests
              </div>
              {debate!.raiseHandRequests
                .filter((req: { status: string }) => req.status === "pending")
                .map((req: { id: string; requesterId: string; side: string; reason?: string }) => {
                  const canDecide = req.requesterId !== session?.user?.id
                  return (
                    <div 
                      key={req.id}
                      style={{
                        padding: "10px 12px",
                        background: "var(--muted)",
                        borderRadius: "var(--radius-md)",
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", marginBottom: 4 }}>
                        {req.side.charAt(0).toUpperCase() + req.side.slice(1)} raises hand
                      </div>
                      {req.reason && (
                        <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 8 }}>
                          "{req.reason}"
                        </div>
                      )}
                      {canDecide && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => decideRaiseHand.mutate({ requestId: req.id, decision: "granted" })}
                            disabled={decideRaiseHand.isPending}
                            style={{ fontSize: 11, padding: "4px 8px" }}
                          >
                            Grant
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => decideRaiseHand.mutate({ requestId: req.id, decision: "declined" })}
                            disabled={decideRaiseHand.isPending}
                            style={{ fontSize: 11, padding: "4px 8px" }}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          )}

          {/* Connection Status */}
          <div className="card" style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: connectionStatus === "connected" ? "var(--notion-accent-teal)" : 
                          connectionStatus === "reconnecting" ? "var(--notion-accent-orange)" : 
                          "var(--destructive)",
              }} />
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                {connectionStatus === "connected" ? "Connected" :
                 connectionStatus === "reconnecting" ? "Reconnecting..." :
                 "Disconnected"}
              </span>
            </div>
          </div>

          {/* Debate info */}
          <div className="card" style={{ padding: "16px" }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>
              Debate Info
            </div>
            {[
              ["Status", statusLabel],
              ["Max rounds", debate!.maxRounds],
              ["Characters / turn", debate!.maxCharactersPerTurn],
              ["Messages", debate!.messages.length],
            ].map(([label, value]) => (
              <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
                <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => exportDebate.mutate({ debateId: debateId ?? "", includeLawyerLogs: false })}
              disabled={exportDebate.isPending}
              style={{ width: "100%", marginTop: 12 }}
            >
              {exportDebate.isPending ? "Exporting..." : "📥 Export Debate"}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
