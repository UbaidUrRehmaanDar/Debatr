function renderAnalytics() {
  const stats = [
    { label: 'Total Debates', value: '18', sub: 'all time' },
    { label: 'Win Rate', value: '72%', sub: '13 wins \u00b7 5 losses' },
    { label: 'Avg. Judge Score', value: '81', sub: 'out of 100' },
    { label: 'Current Rating', value: '1540', sub: '+160 since January' },
  ];

  const strengths = [
    { label: 'Logic', score: 87 },
    { label: 'Evidence', score: 74 },
    { label: 'Rebuttal', score: 81 },
    { label: 'Clarity', score: 90 },
  ];

  return `
    <div class="page-content">
      <div class="page-header"><h1>Analytics</h1><p>Review your debating activity and progress.</p></div>
      <div class="insights-sections">
        <div class="section">
          <div class="section-header"><h2 class="section-title">Overview</h2><div class="section-line"></div></div>
          <div class="insights-grid">
            ${stats.map(m => `
              <div class="insight-stat">
                <div class="insight-value">${m.value}</div>
                <div class="insight-label">${m.label}</div>
                <div class="insight-sub">${m.sub}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section">
          <div class="section-header"><h2 class="section-title">Strengths</h2><div class="section-line"></div></div>
          <div class="strengths-list">
            ${strengths.map(x => `
              <div class="strength-row">
                <span class="strength-label">${x.label}</span>
                <div class="strength-bar-bg"><div class="strength-bar-fill" style="width:${x.score}%"></div></div>
                <span class="strength-score">${x.score}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section">
          <div class="section-header"><h2 class="section-title">Monthly Activity</h2><div class="section-line"></div></div>
          <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:var(--space-lg);">
            <div class="chart-container" style="height:180px;position:relative;">
              <svg width="100%" height="180" viewBox="0 0 700 180" style="overflow:visible;">
                <line x1="50" y1="20" x2="680" y2="20" stroke="var(--border)" stroke-width="1"/>
                <line x1="50" y1="60" x2="680" y2="60" stroke="var(--border)" stroke-width="1"/>
                <line x1="50" y1="100" x2="680" y2="100" stroke="var(--border)" stroke-width="1"/>
                <line x1="50" y1="140" x2="680" y2="140" stroke="var(--border)" stroke-width="1"/>
                <text x="40" y="24" text-anchor="end" fill="var(--muted-foreground)" font-size="11">25</text>
                <text x="40" y="64" text-anchor="end" fill="var(--muted-foreground)" font-size="11">20</text>
                <text x="40" y="104" text-anchor="end" fill="var(--muted-foreground)" font-size="11">15</text>
                <text x="40" y="144" text-anchor="end" fill="var(--muted-foreground)" font-size="11">10</text>
                <path d="M100,100 L155,116 L210,88 L265,108 L320,72 L375,92 L430,56 L485,76 L540,40 L595,60 L650,24" fill="none" stroke="var(--foreground)" stroke-width="2" stroke-linejoin="round"/>
                <circle cx="100" cy="100" r="3.5" fill="var(--foreground)" stroke="var(--background)" stroke-width="2"/>
                <circle cx="210" cy="88" r="3.5" fill="var(--foreground)" stroke="var(--background)" stroke-width="2"/>
                <circle cx="320" cy="72" r="3.5" fill="var(--foreground)" stroke="var(--background)" stroke-width="2"/>
                <circle cx="430" cy="56" r="3.5" fill="var(--foreground)" stroke="var(--background)" stroke-width="2"/>
                <circle cx="540" cy="40" r="3.5" fill="var(--foreground)" stroke="var(--background)" stroke-width="2"/>
                <circle cx="650" cy="24" r="3.5" fill="var(--foreground)" stroke="var(--background)" stroke-width="2"/>
                <text x="100" y="160" text-anchor="middle" fill="var(--muted-foreground)" font-size="11">Jan</text>
                <text x="210" y="160" text-anchor="middle" fill="var(--muted-foreground)" font-size="11">Mar</text>
                <text x="320" y="160" text-anchor="middle" fill="var(--muted-foreground)" font-size="11">May</text>
                <text x="430" y="160" text-anchor="middle" fill="var(--muted-foreground)" font-size="11">Jul</text>
                <text x="540" y="160" text-anchor="middle" fill="var(--muted-foreground)" font-size="11">Sep</text>
                <text x="650" y="160" text-anchor="middle" fill="var(--muted-foreground)" font-size="11">Nov</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
