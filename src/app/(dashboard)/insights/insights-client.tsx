"use client"

const TrendingUp = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

interface InsightsData {
  stats: Array<{
    label: string
    value: string
    sub: string
    suffix?: string
    delta?: string
    deltaTone?: "positive" | "negative"
  }>
  strengths: Array<{ label: string; score: number }>
  monthlyActivity: number[]
}

export function InsightsClient({ insights }: { insights: InsightsData }) {
  const { stats, strengths, monthlyActivity } = insights

  // Generate chart points from monthly activity data
  const maxActivity = Math.max(...monthlyActivity, 10)
  const chartPoints = monthlyActivity.map((count, index) => {
    const x = 100 + index * 55
    const y = 140 - (count / maxActivity) * 120
    return { x, y, count }
  })

  return (
    <div className="insights-sections">
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Overview</h2>
            <div className="section-line" />
          </div>
          <div className="insights-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="insight-stat">
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                  <div className="insight-value" style={{ marginBottom: 0 }}>
                    {stat.value}
                  </div>
                  {stat.suffix && (
                    <span style={{ fontSize: 14, color: "var(--muted-foreground)", fontVariantNumeric: "tabular-nums", lineHeight: 1.1, paddingBottom: 2 }}>
                      {stat.suffix}
                    </span>
                  )}
                  {stat.delta && stat.deltaTone === "positive" && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 3,
                      padding: "2px 7px", borderRadius: 999,
                      fontSize: 11, fontWeight: 500, letterSpacing: "-0.005em",
                      background: "rgba(26, 174, 57, 0.09)",
                      color: "var(--notion-accent-green)",
                      marginLeft: "auto",
                    }}>
                      <TrendingUp />
                      {stat.delta}
                    </span>
                  )}
                </div>
                <div className="insight-label" style={{ marginTop: 6 }}>
                  {stat.label}
                </div>
                <div className="insight-sub" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  {stat.label === "Win Rate" && (
                    <span style={{
                      display: "inline-block", width: 8, height: 8, borderRadius: 999,
                      background: "var(--notion-accent-green)",
                      flexShrink: 0,
                    }} />
                  )}
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Strengths</h2>
            <div className="section-line" />
          </div>
          <div className="strengths-list">
            {strengths.map((strength) => (
              <div key={strength.label} className="strength-row">
                <span className="strength-label">{strength.label}</span>
                <div className="strength-bar-bg">
                  <div
                    className="strength-bar-fill"
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                <span className="strength-score">{strength.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Monthly Activity</h2>
            <div className="section-line" />
          </div>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "var(--space-lg)" }}>
            <div className="chart-container" style={{ height: "180px", position: "relative" }}>
              <svg
                width="100%"
                height="180"
                viewBox="0 0 700 180"
                style={{ overflow: "visible" }}
              >
                {/* Grid lines */}
                <line x1="50" y1="20" x2="680" y2="20" stroke="var(--border)" strokeWidth="1" />
                <line x1="50" y1="60" x2="680" y2="60" stroke="var(--border)" strokeWidth="1" />
                <line x1="50" y1="100" x2="680" y2="100" stroke="var(--border)" strokeWidth="1" />
                <line x1="50" y1="140" x2="680" y2="140" stroke="var(--border)" strokeWidth="1" />
                
                {/* Y-axis labels */}
                <text x="40" y="24" textAnchor="end" fill="var(--muted-foreground)" fontSize="11">{maxActivity}</text>
                <text x="40" y="64" textAnchor="end" fill="var(--muted-foreground)" fontSize="11">{Math.round(maxActivity * 0.75)}</text>
                <text x="40" y="104" textAnchor="end" fill="var(--muted-foreground)" fontSize="11">{Math.round(maxActivity * 0.5)}</text>
                <text x="40" y="144" textAnchor="end" fill="var(--muted-foreground)" fontSize="11">{Math.round(maxActivity * 0.25)}</text>
                
                {/* Chart line */}
                <path
                  d={`M${chartPoints.map(p => `${p.x},${p.y}`).join(' L')}`}
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                {chartPoints.map((point, index) => (
                  <circle 
                    key={index} 
                    cx={point.x} 
                    cy={point.y} 
                    r="3.5" 
                    fill="var(--foreground)" 
                    stroke="var(--background)" 
                    strokeWidth="2" 
                  />
                ))}
                
                {/* X-axis labels */}
                {chartPoints.map((point, index) => {
                  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                  const currentMonth = new Date().getMonth()
                  const monthIndex = (currentMonth - 11 + index + 12) % 12
                  return (
                    <text 
                      key={index} 
                      x={point.x} 
                      y="160" 
                      textAnchor="middle" 
                      fill="var(--muted-foreground)" 
                      fontSize="11"
                    >
                     {months[monthIndex]}
                    </text>
                  )
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
  )
}
