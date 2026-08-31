function renderHelp() {
  const faqItems = [
    { q: 'How do I create a debate?', a: 'Navigate to the Debates page and click "New Debate." Choose a topic, set the format, and invite an opponent or let the AI match you.' },
    { q: 'How does the AI coaching work?', a: 'The AI Lawyer analyzes your arguments, suggests improvements, and helps you find stronger evidence. It adapts to your debate style over time.' },
    { q: 'What happens after a debate ends?', a: 'The AI Judge scores both sides on argument strength, evidence, and delivery. You receive a detailed breakdown and can review the full transcript.' },
    { q: 'Can I fact-check my opponent\'s claims?', a: 'Yes! The AI Fact-checker automatically flags unverifiable claims and provides sourced counter-evidence during the debate.' },
    { q: 'How do invitations work?', a: 'You can invite others via email. They receive a link to join Debatr. Invitations expire after 3\u201330 days depending on your settings.' },
    { q: 'Is my data private?', a: 'Your debates are private and encrypted. We never sell your data. See our Privacy Policy for full details on data handling.' },
  ];

  return `
    <div class="page-content-narrow">
      <div class="page-header" style="text-align:center;">
        <div style="width:64px;height:64px;margin:0 auto 20px;background:linear-gradient(135deg,var(--notion-accent-purple),var(--notion-accent-sky));border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center;color:#fff;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h1>Help & FAQ</h1>
        <p>Everything you need to know about Debatr</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:48px;">
        <div class="card">
          <h3 style="font-size:15px;font-weight:500;color:var(--foreground);margin-bottom:12px;display:flex;align-items:center;gap:8px;"><span style="font-size:18px;">\uD83D\uDE80</span> Getting Started</h3>
          <ul style="display:flex;flex-direction:column;gap:6px;">
            <li style="font-size:13px;color:var(--muted-foreground);padding-left:16px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:7px;width:6px;height:6px;background:var(--notion-accent-purple);border-radius:50%;"></span>Create your account with email</li>
            <li style="font-size:13px;color:var(--muted-foreground);padding-left:16px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:7px;width:6px;height:6px;background:var(--notion-accent-purple);border-radius:50%;"></span>Verify your email address</li>
            <li style="font-size:13px;color:var(--muted-foreground);padding-left:16px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:7px;width:6px;height:6px;background:var(--notion-accent-purple);border-radius:50%;"></span>Start or join a debate</li>
            <li style="font-size:13px;color:var(--muted-foreground);padding-left:16px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:7px;width:6px;height:6px;background:var(--notion-accent-purple);border-radius:50%;"></span>Use AI coaching to improve</li>
          </ul>
        </div>
        <div class="card">
          <h3 style="font-size:15px;font-weight:500;color:var(--foreground);margin-bottom:12px;display:flex;align-items:center;gap:8px;"><span style="font-size:18px;">\u2696\uFE0F</span> Debates</h3>
          <ul style="display:flex;flex-direction:column;gap:6px;">
            <li style="font-size:13px;color:var(--muted-foreground);padding-left:16px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:7px;width:6px;height:6px;background:var(--notion-accent-purple);border-radius:50%;"></span>Structured rounds and turns</li>
            <li style="font-size:13px;color:var(--muted-foreground);padding-left:16px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:7px;width:6px;height:6px;background:var(--notion-accent-purple);border-radius:50%;"></span>AI-powered lawyer assistance</li>
            <li style="font-size:13px;color:var(--muted-foreground);padding-left:16px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:7px;width:6px;height:6px;background:var(--notion-accent-purple);border-radius:50%;"></span>Real-time fact-checking</li>
            <li style="font-size:13px;color:var(--muted-foreground);padding-left:16px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:7px;width:6px;height:6px;background:var(--notion-accent-purple);border-radius:50%;"></span>Score tracking and history</li>
          </ul>
        </div>
        <div class="card">
          <h3 style="font-size:15px;font-weight:500;color:var(--foreground);margin-bottom:12px;display:flex;align-items:center;gap:8px;"><span style="font-size:18px;">\uD83E\uDD16</span> AI Features</h3>
          <ul style="display:flex;flex-direction:column;gap:6px;">
            <li style="font-size:13px;color:var(--muted-foreground);padding-left:16px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:7px;width:6px;height:6px;background:var(--notion-accent-purple);border-radius:50%;"></span><strong>Lawyer:</strong> Draft arguments & rebuttals</li>
            <li style="font-size:13px;color:var(--muted-foreground);padding-left:16px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:7px;width:6px;height:6px;background:var(--notion-accent-purple);border-radius:50%;"></span><strong>Judge:</strong> Impartial scoring & feedback</li>
            <li style="font-size:13px;color:var(--muted-foreground);padding-left:16px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:7px;width:6px;height:6px;background:var(--notion-accent-purple);border-radius:50%;"></span><strong>Fact-checker:</strong> Verify claims in real time</li>
          </ul>
        </div>
        <div class="card">
          <h3 style="font-size:15px;font-weight:500;color:var(--foreground);margin-bottom:12px;display:flex;align-items:center;gap:8px;"><span style="font-size:18px;">\uD83D\uDD12</span> Privacy & Security</h3>
          <ul style="display:flex;flex-direction:column;gap:6px;">
            <li style="font-size:13px;color:var(--muted-foreground);padding-left:16px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:7px;width:6px;height:6px;background:var(--notion-accent-purple);border-radius:50%;"></span>Debates are private by default</li>
            <li style="font-size:13px;color:var(--muted-foreground);padding-left:16px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:7px;width:6px;height:6px;background:var(--notion-accent-purple);border-radius:50%;"></span>Email verification required</li>
            <li style="font-size:13px;color:var(--muted-foreground);padding-left:16px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:7px;width:6px;height:6px;background:var(--notion-accent-purple);border-radius:50%;"></span>Encrypted data storage</li>
            <li style="font-size:13px;color:var(--muted-foreground);padding-left:16px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:7px;width:6px;height:6px;background:var(--notion-accent-purple);border-radius:50%;"></span>No data sold to third parties</li>
          </ul>
        </div>
      </div>

      <div style="margin-bottom:48px;">
        <h2 style="font-size:20px;font-weight:500;color:var(--foreground);margin-bottom:20px;">Frequently Asked Questions</h2>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${faqItems.map((item, i) => `
            <div class="card" style="padding:0;overflow:hidden;">
              <button class="accordion-trigger" aria-expanded="false" onclick="var exp=this.getAttribute('aria-expanded')==='true';this.setAttribute('aria-expanded',!exp);this.nextElementSibling.style.display=exp?'none':'block';" style="width:100%;padding:16px 20px;background:transparent;border:none;color:var(--foreground);font-size:14px;font-weight:500;text-align:left;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">
                ${item.q}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <div style="padding:0 20px 16px;font-size:13.5px;color:var(--muted-foreground);line-height:1.7;display:none;">${item.a}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card" style="text-align:center;padding:36px;">
        <h2 style="font-size:20px;font-weight:500;color:var(--foreground);margin-bottom:8px;">Still need help?</h2>
        <p style="font-size:14px;color:var(--muted-foreground);margin-bottom:20px;">Our team is here to assist you with anything.</p>
        <button class="btn btn-primary btn-lg">Contact Support</button>
      </div>
    </div>
  `;
}
