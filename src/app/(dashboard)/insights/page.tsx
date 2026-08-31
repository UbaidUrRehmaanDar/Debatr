import { auth } from "@/server/auth"
import { prisma } from "@/server/db"
import { InsightsClient } from "./insights-client"

// Enable ISR with 5-minute revalidation for analytics data
export const revalidate = 300

async function getUserInsights(userId: string) {
  // Get all user's debates
  const debates = await prisma.debate.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
    include: {
      participants: true,
      judgeReport: true,
    },
  })

  const totalDebates = debates.length
  const completedDebates = debates.filter(d => d.status === "completed")
  
  // Calculate wins/losses
  let wins = 0
  let losses = 0
  let totalScore = 0
  let scoreCount = 0
  
  completedDebates.forEach(debate => {
    const userParticipant = debate.participants.find(p => p.userId === userId)
    if (debate.judgeReport && userParticipant) {
      if (debate.judgeReport.outcome === "affirmative_wins" && userParticipant.side === "affirmative") {
        wins++
      } else if (debate.judgeReport.outcome === "negative_wins" && userParticipant.side === "negative") {
        wins++
      } else {
        losses++
      }
      
      // Extract score from judge report if available
      if (debate.judgeReport.scores && typeof debate.judgeReport.scores === "object") {
        const scores = debate.judgeReport.scores as any
        if (scores.total) {
          totalScore += scores.total
          scoreCount++
        }
      }
    }
  })

  const winRate = totalDebates > 0 ? Math.round((wins / (wins + losses)) * 100) : 0
  const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0

  // Calculate rating (simplified ELO-like system)
  const baseRating = 1200
  const ratingChange = wins * 25 - losses * 15
  const currentRating = baseRating + ratingChange

  // Calculate strengths from judge reports
  const strengthData = { logic: 0, evidence: 0, rebuttal: 0, clarity: 0 }
  let strengthCount = 0

  completedDebates.forEach(debate => {
    if (debate.judgeReport?.strengths && typeof debate.judgeReport.strengths === "object") {
      const strengths = debate.judgeReport.strengths as any
      if (strengths.logic) strengthData.logic += strengths.logic
      if (strengths.evidence) strengthData.evidence += strengths.evidence
      if (strengths.rebuttal) strengthData.rebuttal += strengths.rebuttal
      if (strengths.clarity) strengthData.clarity += strengths.clarity
      strengthCount++
    }
  })

  const strengths = [
    { label: "Logic", score: strengthCount > 0 ? Math.round(strengthData.logic / strengthCount) : 0 },
    { label: "Evidence", score: strengthCount > 0 ? Math.round(strengthData.evidence / strengthCount) : 0 },
    { label: "Rebuttal", score: strengthCount > 0 ? Math.round(strengthData.rebuttal / strengthCount) : 0 },
    { label: "Clarity", score: strengthCount > 0 ? Math.round(strengthData.clarity / strengthCount) : 0 },
  ]

  // Monthly activity data
  const monthlyActivity = Array(12).fill(0)
  const now = new Date()
  
  debates.forEach(debate => {
    const debateDate = new Date(debate.createdAt)
    const monthDiff = (now.getFullYear() - debateDate.getFullYear()) * 12 + (now.getMonth() - debateDate.getMonth())
    if (monthDiff >= 0 && monthDiff < 12) {
      monthlyActivity[11 - monthDiff]++
    }
  })

  return {
    stats: [
      { label: "Total Debates", value: totalDebates.toString(), sub: "all time" },
      { label: "Win Rate", value: `${winRate}%`, sub: `${wins} wins · ${losses} losses` },
      { label: "Avg. Judge Score", value: avgScore.toString(), sub: "out of 100", suffix: "/100" },
      {
        label: "Current Rating",
        value: currentRating.toString(),
        sub: `+${ratingChange} since January`,
        delta: `+${ratingChange}`,
        deltaTone: "positive" as const,
      },
    ],
    strengths,
    monthlyActivity,
  }
}

export default async function InsightsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return (
      <main className="page-content page-enter">
        <div className="empty-state" style={{ paddingBlock: 64 }}>
          <div className="empty-state-title">Authentication required</div>
          <p className="empty-state-desc">Please sign in to view your insights.</p>
        </div>
      </main>
    )
  }

  const insights = await getUserInsights(session.user.id)

  return (
    <main className="page-content page-enter">
      <div className="page-header">
        <h1>Insights</h1>
        <p>Explore AI‑generated insights for your debates.</p>
      </div>
      <div className="card">
        <InsightsClient insights={insights} />
      </div>
    </main>
  )
}

