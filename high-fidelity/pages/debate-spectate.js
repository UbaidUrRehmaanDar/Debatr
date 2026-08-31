function renderDebateSpectate() {
  const messages = [
    { id: 1, side: 'affirmative', sender: 'Sarah Chen', timestamp: 'Round 1 \u00b7 Today, 1:30 PM', content: 'AI systems are becoming increasingly powerful and autonomous, operating in domains where their decisions have life-altering consequences. From criminal sentencing algorithms to hiring tools that discriminate based on gender, the evidence of harm is already substantial.' },
    { id: 2, side: 'negative', sender: 'Marcus Johnson', timestamp: 'Round 1 \u00b7 Today, 1:45 PM', content: 'While AI advancement is important, heavy regulation stifles the innovation that drives economic growth and societal benefit. The technology is still in its early stages, and premature regulation could cement current paradigms while preventing breakthroughs.' },
    { id: 3, side: 'affirmative', sender: 'Sarah Chen', timestamp: 'Round 2 \u00b7 Today, 2:14 PM', content: 'The risks of unregulated AI are well-documented. The EU AI Act, China\'s algorithmic regulation, and proposed US legislation all recognize the need for proactive governance. Self-regulation has demonstrably failed.' },
    { id: 4, side: 'negative', sender: 'Marcus Johnson', timestamp: 'Round 2 \u00b7 Today, 2:30 PM', content: 'Innovation thrives in light-touch regulatory environments. Look at the internet boom - it happened precisely because regulators took a hands-off approach. Heavy-handed AI regulation would push development offshore.' },
  ];

  const pinnedEvidence = [
    { id: 1, author: 'Sarah Chen', side: 'affirmative', claim: 'The EU AI Act classifies AI systems by risk level and mandates compliance requirements for high-risk applications.', source: 'European Commission, 2024', citedIn: 'Round 2' },
    { id: 2, author: 'Marcus Johnson', side: 'negative', claim: 'A Brookings Institution study found that overly restrictive AI regulation could reduce sector-specific GDP growth by 1.2% annually.', source: 'Brookings Institution, 2024', citedIn: 'Round 1' },
  ];

  return `
    <div class="page-content">
      <button class="btn btn-ghost btn-sm" style="margin-bottom:24px;" onclick="navigate('debates')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Debates
      </button>

      <div style="margin-bottom:24px;">
        <h1 style="font-size:24px;font-weight:500;letter-spacing:-0.03em;color:var(--foreground);margin-bottom:8px;">Is AI regulation necessary?</h1>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span class="badge badge-purple" style="gap:6px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            Spectating
          </span>
          <span class="badge badge-info">Completed</span>
        </div>
        <p style="font-size:13px;color:var(--muted-foreground);">Round 2 of 4 &middot; Affirmative: Sarah Chen &middot; Negative: Marcus Johnson</p>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <div style="display:flex;gap:16px;align-items:flex-start;">
          <div style="width:48px;height:48px;border-radius:50%;background:rgba(221,91,0,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--notion-accent-orange)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
          </div>
          <div style="flex:1;">
            <h2 style="font-size:16px;font-weight:500;color:var(--foreground);margin-bottom:8px;">Judge's Decision</h2>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              <span class="badge badge-success">Affirmative Wins</span>
              <span style="font-size:13px;color:var(--muted-foreground);">Confidence: <strong style="color:var(--foreground);">82%</strong></span>
            </div>
            <p style="font-size:13.5px;color:var(--foreground);line-height:1.7;">The affirmative presented a more compelling case for AI regulation, demonstrating stronger logical consistency and more effective use of evidence. The proactive regulatory framework argument was particularly persuasive.</p>
          </div>
        </div>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <h2 style="font-size:15px;font-weight:500;color:var(--foreground);margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          Debate Transcript
        </h2>
        <div style="display:flex;flex-direction:column;gap:24px;">
          ${messages.map(m => `
            <div style="display:flex;gap:14px;align-items:flex-start;">
              <div style="width:36px;height:36px;border-radius:50%;background:${m.side==='affirmative'?'var(--notion-accent-sky)':'var(--notion-accent-orange)'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:600;flex-shrink:0;">${m.side==='affirmative'?'A':'N'}</div>
              <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                  <span style="font-size:13px;font-weight:500;color:var(--foreground);">${m.sender}</span>
                  <span class="badge ${m.side==='affirmative'?'badge-info':'badge-warning'}" style="font-size:10px;height:18px;padding:0 6px;">${m.side==='affirmative'?'Affirmative':'Negative'}</span>
                </div>
                <p style="font-size:11px;color:var(--muted-foreground);margin-bottom:8px;">${m.timestamp}</p>
                <div style="background:var(--muted);border:1px solid var(--border);border-left:4px solid ${m.side==='affirmative'?'var(--notion-accent-sky)':'var(--notion-accent-orange)'};border-radius:0 var(--radius-md) var(--radius-md) var(--radius-md);padding:14px;">
                  <p style="font-size:13.5px;color:var(--foreground);line-height:1.7;">${m.content}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <h2 style="font-size:15px;font-weight:500;color:var(--foreground);margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7Z"/><path d="M14 2v4a2 2 0 002 2h4"/></svg>
          Pinned Evidence
        </h2>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${pinnedEvidence.map(e => `
            <div style="border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <span class="badge ${e.side==='affirmative'?'badge-info':'badge-warning'}" style="font-size:10px;height:18px;padding:0 6px;">${e.side==='affirmative'?'Affirmative':'Negative'}</span>
                <span style="font-size:11px;color:var(--muted-foreground);">${e.author} &middot; Cited in ${e.citedIn}</span>
              </div>
              <p style="font-size:13px;color:var(--foreground);margin-bottom:6px;">${e.claim}</p>
              <p style="font-size:12px;color:var(--muted-foreground);font-style:italic;">Source: ${e.source}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
