import Link from "next/link"
import { auth } from "@/server/auth"
import { prisma } from "@/server/db"
import { revalidatePath } from "next/cache"

// Enable ISR with 60-second revalidation
export const revalidate = 60

const STATUS_LABELS: Record<string, string> = {
  won: "Won",
  lost: "Lost",
  ongoing: "Ongoing",
  active: "Ongoing",
  waiting_for_participants: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
}

function StatusDot({ status }: { status: string }) {
  const cls =
    status === "won" || status === "completed"
      ? "won"
      : status === "ongoing" || status === "active"
        ? "ongoing"
        : "lost"
  return <span className={`status-dot ${cls}`} />
}

function formatDate(date: Date | null): string {
  if (!date) return "-"
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString()
}

export default async function DebatesPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return (
      <main className="page-content page-enter">
        <div className="empty-state" style={{ paddingBlock: 64 }}>
          <div className="empty-state-title">Authentication required</div>
          <p className="empty-state-desc">Please sign in to view your debates.</p>
        </div>
      </main>
    )
  }

  const userId = session.user.id

  // Fetch real debates from database
  const debates = await prisma.debate.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      },
      judgeReport: {
        select: { outcome: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  })

  // Transform debates to match expected format
  const formattedDebates = debates.map((debate) => {
    const otherParticipant = debate.participants.find((p) => p.userId !== userId)
    const userParticipant = debate.participants.find((p) => p.userId === userId)
    
    // Determine status based on debate status and judge report
    let status: string = debate.status
    let score: number | null = null
    
    if (debate.status === "completed" && debate.judgeReport) {
      // Determine win/loss based on judge report
      if (debate.judgeReport.outcome === "affirmative_wins") {
        status = userParticipant?.side === "affirmative" ? "won" : "lost"
      } else if (debate.judgeReport.outcome === "negative_wins") {
        status = userParticipant?.side === "negative" ? "won" : "lost"
      }
    }

    return {
      id: debate.id,
      title: debate.topic,
      topic: debate.description || debate.topic.split(" ").slice(0, 2).join(" "),
      status,
      score,
      opponent: otherParticipant?.user.name || otherParticipant?.user.email || "Unknown",
      date: formatDate(debate.updatedAt),
    }
  })

  return (
    <main className="page-content page-enter">
      {/* Header */}
      <div className="debates-top">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em", color: "var(--foreground)", marginBottom: 4 }}>
            Debates
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
            Your complete debate history and active sessions.
          </p>
        </div>
        <Link
          href="/debates/new"
          className="btn btn-primary"
          style={{ height: 40, paddingInline: 16, fontSize: 14, borderRadius: "var(--radius-lg)", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
          </svg>
          New Debate
        </Link>
      </div>

      {/* Table header */}
      <div className="debates-table-header">
        <span>DEBATE</span>
        <span>STATUS</span>
        <span>SCORE</span>
        <span style={{ textAlign: "right" }}>OPPONENT</span>
        <span style={{ textAlign: "right" }}>DATE</span>
      </div>

      {/* Debate rows */}
      {formattedDebates.length > 0 ? (
        formattedDebates.map((debate: any) => (
          <Link key={debate.id} href={`/debates/${debate.id}`} className="debate-row">
            <div>
              <div className="debate-row-title">{debate.title}</div>
              <div className="debate-row-topic">{debate.topic}</div>
            </div>
            <div className="debate-row-status">
              <StatusDot status={debate.status} />
              {STATUS_LABELS[debate.status] ?? debate.status}
            </div>
            <div className={`debate-row-score ${!debate.score ? "empty" : ""}`}>
              {debate.score ?? "-"}
            </div>
            <div className="debate-row-opp">{debate.opponent}</div>
            <div className="debate-row-date">{debate.date}</div>
          </Link>
        ))
      ) : (
        <div className="empty-state" style={{ paddingBlock: 64 }}>
          <div className="empty-state-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div className="empty-state-title">No debates yet</div>
          <p className="empty-state-desc">
            Create a debate by inviting another user. You&apos;ll both take timed turns presenting arguments.
          </p>
          <Link href="/debates/new" className="btn btn-primary">
            Create first debate
          </Link>
        </div>
      )}
    </main>
  )
}
