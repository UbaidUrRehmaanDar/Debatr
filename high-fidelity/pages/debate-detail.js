function renderDebateDetail() {
  const messages = [
    { id: 1, side: 'affirmative', sender: 'Sarah Chen', timestamp: 'Today, 2:14 PM', content: 'AI systems are becoming increasingly powerful and autonomous, operating in domains where their decisions have life-altering consequences. From criminal sentencing algorithms to hiring tools that discriminate based on gender, the evidence of harm is already substantial. Without comprehensive regulation, we risk entrenching biases and creating systems that no one truly understands or can hold accountable. The precautionary principle demands we act now, before irreversible damage occurs.' },
    { id: 2, side: 'negative', sender: 'Marcus Johnson', timestamp: 'Today, 2:28 PM', content: 'While AI advancement is important, heavy regulation stifles the innovation that drives economic growth and societal benefit. The technology is still in its early stages, and premature regulation could cement current paradigms while preventing breakthroughs. We should focus on targeted, outcome-based regulation rather than broad restrictions that catch beneficial uses alongside harmful ones.' },
    { id: 3, side: 'affirmative', sender: 'Sarah Chen', timestamp: 'Today, 2:45 PM', content: 'The risks of unregulated AI are well-documented. The EU AI Act, China\'s algorithmic regulation, and proposed US legislation all recognize the need for proactive governance. Self-regulation has demonstrably failed - companies consistently prioritize profit over safety when left to their own devices.' },
    { id: 4, side: 'negative', sender: 'Marcus Johnson', timestamp: 'Today, 3:02 PM', content: 'Innovation thrives in light-touch regulatory environments. Look at the internet boom - it happened precisely because regulators took a hands-off approach. Heavy-handed AI regulation would push development offshore to jurisdictions with no oversight at all.' },
    { id: 5, side: 'affirmative', sender: 'Sarah Chen', timestamp: 'Today, 3:18 PM', content: 'We need proactive regulation, not reactive patchwork. The comparison to the internet is flawed - social media\'s unregulated growth led to election interference, mental health crises, and misinformation pandemics. We cannot afford to repeat those mistakes with AI.' },
    { id: 6, side: 'negative', sender: 'Marcus Johnson', timestamp: 'Today, 3:35 PM', content: 'Market forces and industry self-regulation have proven effective at driving responsible AI development. Companies that deploy unsafe or biased systems face reputational damage, customer loss, and legal liability. Government regulation, by contrast, is slow and bureaucratic.' },
  ];

  const evidence = [
    { id: 1, author: 'Sarah Chen', side: 'affirmative', claim: 'The EU AI Act classifies AI systems by risk level and mandates compliance requirements for high-risk applications.', source: 'European Commission, 2024', timestamp: '1 hour ago' },
    { id: 2, author: 'Marcus Johnson', side: 'negative', claim: 'A Brookings study found that over-regulation could reduce AI-related GDP growth by 1.2% annually in regulated sectors.', source: 'Brookings Institution, 2024', timestamp: '45 min ago' },
  ];

  const reactions = [
    { emoji: '\uD83D\uDC4D', count: 3 }, { emoji: '\uD83D\uDC4E', count: 1 }, { emoji: '\uD83D\uDD25', count: 2 }, { emoji: '\uD83E\uDD14', count: 4 },
  ];

  return `
    <div class="page-content">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <button class="btn btn-ghost btn-sm" onclick="navigate('debates')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Debates
        </button>
        <button class="btn btn-ghost btn-icon-sm" title="Bookmark">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
        </button>
      </div>

      <div style="margin-bottom:24px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
          <h1 style="font-size:24px;font-weight:500;letter-spacing:-0.03em;color:var(--foreground);">Is AI regulation necessary?</h1>
          <span class="badge badge-success">Active</span>
        </div>
        <p style="font-size:13px;color:var(--muted-foreground);">Round 2 of 4 &middot; Affirmative: Sarah Chen &middot; Negative: Marcus Johnson</p>
        <div style="display:flex;align-items:center;gap:12px;margin-top:12px;">
          <span class="badge badge-success" style="gap:6px;">
            <span style="width:6px;height:6px;border-radius:50%;background:var(--notion-accent-green);animation:pulse 2s infinite;"></span>
            Connected
          </span>
          <span style="font-size:12px;color:var(--muted-foreground);display:flex;align-items:center;gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            2 online
          </span>
        </div>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <div style="display:flex;flex-direction:column;gap:24px;">
          ${messages.map(m => `
            <div style="display:flex;gap:14px;align-items:flex-start;">
              <div style="width:36px;height:36px;border-radius:50%;background:${m.side==='affirmative'?'var(--notion-accent-sky)':'var(--notion-accent-orange)'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:600;flex-shrink:0;">${m.side==='affirmative'?'A':'N'}</div>
              <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                  <span style="font-size:13px;font-weight:500;color:var(--foreground);">${m.sender}</span>
                  <span class="badge ${m.side==='affirmative'?'badge-info':'badge-warning'}" style="font-size:10px;height:18px;padding:0 6px;">${m.side==='affirmative'?'Affirmative':'Negative'}</span>
                  <span style="font-size:11px;color:var(--muted-foreground);">${m.timestamp}</span>
                </div>
                <div style="background:var(--muted);border:1px solid var(--border);border-left:4px solid ${m.side==='affirmative'?'var(--notion-accent-sky)':'var(--notion-accent-orange)'};border-radius:0 var(--radius-md) var(--radius-md) var(--radius-md);padding:14px;">
                  <p style="font-size:13.5px;color:var(--foreground);line-height:1.7;">${m.content}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;flex-wrap:wrap;">
        <span style="font-size:12px;color:var(--muted-foreground);margin-right:4px;">React:</span>
        ${reactions.map(r => `<button class="btn btn-secondary btn-sm" style="gap:4px;"><span>${r.emoji}</span>${r.count>0?`<span style="font-size:11px;color:var(--muted-foreground);">${r.count}</span>`:''}</button>`).join('')}
      </div>

      <div class="card" style="margin-bottom:24px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span class="badge badge-info">Affirmative</span>
          <span style="font-size:12px;color:var(--muted-foreground);">Your turn &middot; 2000 characters max</span>
        </div>
        <textarea class="form-input form-textarea" rows="4" placeholder="Type your argument..." style="margin-bottom:12px;"></textarea>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;gap:4px;">
            ${reactions.slice(0,4).map(r => `<button class="btn btn-ghost btn-icon-sm" title="React"><span style="font-size:16px;">${r.emoji}</span></button>`).join('')}
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:12px;color:var(--muted-foreground);">0 / 2000</span>
            <button class="btn btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              Send
            </button>
          </div>
        </div>
      </div>

      <div style="background:rgba(98,174,240,0.06);border:1px solid rgba(98,174,240,0.2);border-radius:var(--radius-lg);padding:16px;margin-bottom:24px;display:flex;align-items:center;gap:14px;">
        <div style="width:40px;height:40px;border-radius:50%;background:rgba(98,174,240,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--notion-accent-sky)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </div>
        <div>
          <p style="font-size:13px;font-weight:500;color:var(--foreground);margin:0;">Current turn: Affirmative</p>
          <p style="font-size:12px;color:var(--muted-foreground);margin:2px 0 0 0;">Sarah Chen has 2000 characters to present their argument for Round 2.</p>
        </div>
      </div>

      <div class="card" style="margin-bottom:24px;">
        <h3 style="font-size:15px;font-weight:500;color:var(--foreground);margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7Z"/><path d="M14 2v4a2 2 0 002 2h4"/></svg>
          Pinned Evidence
        </h3>
        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px;">
          ${evidence.map(e => `
            <div style="border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <span class="badge ${e.side==='affirmative'?'badge-info':'badge-warning'}" style="font-size:10px;height:18px;padding:0 6px;">${e.side==='affirmative'?'Affirmative':'Negative'}</span>
                <span style="font-size:11px;color:var(--muted-foreground);">${e.author} &middot; ${e.timestamp}</span>
              </div>
              <p style="font-size:13px;color:var(--foreground);margin-bottom:6px;">${e.claim}</p>
              <p style="font-size:12px;color:var(--muted-foreground);font-style:italic;">Source: ${e.source}</p>
            </div>
          `).join('')}
        </div>
        <div style="display:flex;gap:8px;">
          <input class="form-input" type="text" placeholder="Add evidence claim..." style="flex:1;height:36px;font-size:13px;" />
          <input class="form-input" type="text" placeholder="Source URL" style="width:200px;height:36px;font-size:13px;" />
          <button class="btn btn-secondary btn-sm">Pin</button>
        </div>
      </div>

      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <h3 style="font-size:15px;font-weight:500;color:var(--foreground);display:flex;align-items:center;gap:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--notion-accent-purple)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            AI Lawyer Assistant
          </h3>
          <button class="btn btn-secondary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            Open Lawyer
          </button>
        </div>
        <textarea class="form-input form-textarea" rows="3" placeholder="Ask the AI lawyer to help strengthen your argument or find counterarguments..." style="margin-bottom:12px;"></textarea>
      </div>
    </div>
  `;
}
