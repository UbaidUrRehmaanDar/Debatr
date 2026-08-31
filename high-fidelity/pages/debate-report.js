function renderDebateReport() {
  const scoreBreakdown = [
    { criteria: 'Logical Consistency', affirmative: 8.5, negative: 7.2, description: 'How well did each side maintain internal consistency and avoid contradictions throughout the debate?' },
    { criteria: 'Evidence Quality', affirmative: 7.8, negative: 6.9, description: 'The credibility, relevance, and strength of sources cited to support arguments.' },
    { criteria: 'Rebuttal Effectiveness', affirmative: 8.1, negative: 7.5, description: 'How effectively each side addressed and countered the opponent\'s key arguments.' },
    { criteria: 'Argument Structure', affirmative: 7.9, negative: 7.0, description: 'The organization, clarity, and logical flow of each side\'s overall argumentation.' },
    { criteria: 'Responsiveness', affirmative: 8.0, negative: 7.3, description: 'How directly and thoroughly each side engaged with the opponent\'s points.' },
  ];

  const strengthsAff = ['Strong use of empirical evidence from EU AI Act and regulatory frameworks', 'Effective anticipation and preemption of counterarguments', 'Clear logical progression from harm identification to policy prescription'];
  const weaknessesAff = ['Could have addressed innovation concerns more directly', 'Limited discussion of implementation challenges'];
  const strengthsNeg = ['Compelling economic growth arguments with concrete examples', 'Strong emphasis on regulatory capture risks', 'Effective use of historical parallels (internet boom)'];
  const weaknessesNeg = ['Insufficient evidence for self-regulation effectiveness', 'Underexplored the severity of AI-specific risks'];

  const fallacies = [
    { type: 'False Equivalence', side: 'Negative', location: 'Round 2, Message 1', explanation: 'Comparing AI regulation to internet regulation oversimplifies the distinct risks of AI systems.' },
    { type: 'Appeal to Consequences', side: 'Affirmative', location: 'Round 1, Message 2', explanation: 'Arguing that lack of regulation will lead to catastrophic outcomes without sufficient evidence.' },
  ];

  const circumference = 2 * Math.PI * 50;
  const scoreOffset = circumference * (1 - 0.75);

  return `
    <div class="page-content">
      <button class="btn btn-ghost btn-sm" style="margin-bottom:24px;" onclick="navigate('debates')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Debate
      </button>

      <div class="card" style="margin-bottom:24px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;">
          <div style="flex:1;">
            <h1 style="font-size:24px;font-weight:500;letter-spacing:-0.03em;color:var(--foreground);margin-bottom:4px;">Judge Report</h1>
            <p style="font-size:13px;color:var(--muted-foreground);margin-bottom:16px;">Is AI regulation necessary?</p>
            <div style="display:flex;align-items:center;gap:12px;">
              <span class="badge badge-success">Affirmative Wins</span>
              <span style="font-size:13px;color:var(--muted-foreground);">Confidence: <strong style="color:var(--foreground);">82%</strong></span>
            </div>
          </div>
          <div class="score-ring">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle class="score-ring-bg" cx="60" cy="60" r="50" stroke-width="10"/>
              <circle class="score-ring-fill" cx="60" cy="60" r="50" stroke-width="10" stroke-dasharray="${circumference}" stroke-dashoffset="${scoreOffset}"/>
            </svg>
            <span class="score-ring-label" style="display:flex;flex-direction:column;align-items:center;">
              <span style="font-size:22px;font-weight:500;">7.5</span>
              <span style="font-size:11px;color:var(--muted-foreground);">/ 10</span>
            </span>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:24px;">
        <button class="btn btn-secondary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          JSON
        </button>
        <button class="btn btn-secondary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          PDF
        </button>
        <button class="btn btn-secondary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Markdown
        </button>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <h2 style="font-size:16px;font-weight:500;color:var(--foreground);margin-bottom:12px;">Verdict</h2>
        <p style="font-size:13.5px;color:var(--foreground);line-height:1.7;">The affirmative side presented a more compelling case for AI regulation, demonstrating stronger logical consistency and more effective use of evidence. While the negative raised valid concerns about innovation stifling, they failed to adequately address the documented harms of unregulated AI deployment. The affirmative's proactive regulatory framework argument was particularly persuasive, though both sides could have engaged more deeply with implementation challenges.</p>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <h2 style="font-size:16px;font-weight:500;color:var(--foreground);margin-bottom:12px;">Summary</h2>
        <p style="font-size:13.5px;color:var(--foreground);line-height:1.7;">This debate on AI regulation featured strong arguments from both sides. The affirmative effectively leveraged regulatory precedents from the EU and China, while the negative compellingly argued for market-driven solutions. The key differentiator was the affirmative's ability to directly address counterarguments and provide concrete examples of regulatory failure in other domains.</p>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <h2 style="font-size:16px;font-weight:500;color:var(--foreground);margin-bottom:16px;">Score Breakdown</h2>
        <div style="display:flex;flex-direction:column;gap:16px;">
          ${scoreBreakdown.map(s => `
            <div>
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <span style="font-size:13px;font-weight:500;color:var(--foreground);">${s.criteria}</span>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="badge ${s.affirmative>s.negative?'badge-info':'badge-neutral'}" style="font-size:11px;">${s.affirmative}</span>
                  <span style="font-size:11px;color:var(--muted-foreground);">vs</span>
                  <span class="badge ${s.negative>s.affirmative?'badge-warning':'badge-neutral'}" style="font-size:11px;">${s.negative}</span>
                </div>
              </div>
              <p style="font-size:12px;color:var(--muted-foreground);margin-bottom:8px;">${s.description}</p>
              <div style="display:flex;flex-direction:column;gap:4px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:11px;color:var(--muted-foreground);width:80px;text-align:right;">Affirmative</span>
                  <div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${(s.affirmative/10)*100}%;background:var(--notion-accent-sky);border-radius:3px;"></div></div>
                  <span style="font-size:12px;font-weight:500;color:var(--foreground);width:32px;">${s.affirmative}</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:11px;color:var(--muted-foreground);width:80px;text-align:right;">Negative</span>
                  <div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${(s.negative/10)*100}%;background:var(--notion-accent-orange);border-radius:3px;"></div></div>
                  <span style="font-size:12px;font-weight:500;color:var(--foreground);width:32px;">${s.negative}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
        <div class="card">
          <h3 style="font-size:14px;font-weight:500;color:var(--foreground);margin-bottom:12px;display:flex;align-items:center;gap:8px;">
            <span style="width:10px;height:10px;border-radius:50%;background:var(--notion-accent-sky);"></span>
            Affirmative
          </h3>
          <div style="margin-bottom:16px;">
            <h4 style="font-size:11px;font-weight:500;color:var(--notion-accent-green);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Strengths</h4>
            <ul style="display:flex;flex-direction:column;gap:6px;">
              ${strengthsAff.map(s => `<li style="font-size:13px;color:var(--foreground);display:flex;align-items:flex-start;gap:8px;line-height:1.5;"><span style="color:var(--notion-accent-green);flex-shrink:0;margin-top:2px;">&#x2713;</span>${s}</li>`).join('')}
            </ul>
          </div>
          <div>
            <h4 style="font-size:11px;font-weight:500;color:var(--destructive);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Weaknesses</h4>
            <ul style="display:flex;flex-direction:column;gap:6px;">
              ${weaknessesAff.map(w => `<li style="font-size:13px;color:var(--foreground);display:flex;align-items:flex-start;gap:8px;line-height:1.5;"><span style="color:var(--destructive);flex-shrink:0;margin-top:2px;">&#x2717;</span>${w}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="card">
          <h3 style="font-size:14px;font-weight:500;color:var(--foreground);margin-bottom:12px;display:flex;align-items:center;gap:8px;">
            <span style="width:10px;height:10px;border-radius:50%;background:var(--notion-accent-orange);"></span>
            Negative
          </h3>
          <div style="margin-bottom:16px;">
            <h4 style="font-size:11px;font-weight:500;color:var(--notion-accent-green);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Strengths</h4>
            <ul style="display:flex;flex-direction:column;gap:6px;">
              ${strengthsNeg.map(s => `<li style="font-size:13px;color:var(--foreground);display:flex;align-items:flex-start;gap:8px;line-height:1.5;"><span style="color:var(--notion-accent-green);flex-shrink:0;margin-top:2px;">&#x2713;</span>${s}</li>`).join('')}
            </ul>
          </div>
          <div>
            <h4 style="font-size:11px;font-weight:500;color:var(--destructive);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Weaknesses</h4>
            <ul style="display:flex;flex-direction:column;gap:6px;">
              ${weaknessesNeg.map(w => `<li style="font-size:13px;color:var(--foreground);display:flex;align-items:flex-start;gap:8px;line-height:1.5;"><span style="color:var(--destructive);flex-shrink:0;margin-top:2px;">&#x2717;</span>${w}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <h2 style="font-size:16px;font-weight:500;color:var(--foreground);margin-bottom:16px;">Logical Fallacies Detected</h2>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${fallacies.map(f => `
            <div style="border:1px solid rgba(221,91,0,0.2);background:rgba(221,91,0,0.04);border-radius:var(--radius-md);padding:14px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--notion-accent-orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span style="font-size:13px;font-weight:500;color:var(--foreground);">${f.type}</span>
                <span class="badge ${f.side==='Affirmative'?'badge-info':'badge-warning'}" style="font-size:10px;height:18px;padding:0 6px;">${f.side}</span>
                <span style="font-size:11px;color:var(--notion-accent-orange);">${f.location}</span>
              </div>
              <p style="font-size:13px;color:var(--foreground);line-height:1.6;">${f.explanation}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;padding-top:16px;">
        <button class="btn btn-secondary" onclick="navigate('debates')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Debate
        </button>
        <button class="btn btn-primary" onclick="navigate('debates')">
          All Debates
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  `;
}
