function renderLegalAi() {
  const messages = [
    { side: 'user', content: 'What legal precedents support AI regulation?' },
    { side: 'assistant', content: 'AI regulation typically follows several key principles: <strong>Transparency</strong> \u2014 requiring organizations to disclose when AI is being used. <strong>Accountability</strong> \u2014 establishing clear lines of responsibility for AI outcomes. <strong>Fairness</strong> \u2014 ensuring AI systems don\'t discriminate. <strong>Safety</strong> \u2014 requiring rigorous testing before deployment. <strong>Privacy</strong> \u2014 protecting personal data used in AI training. <strong>Human oversight</strong> \u2014 maintaining meaningful human control over high-stakes AI decisions.' },
  ];

  const suggestions = ['What legal precedents support AI regulation?','How do I argue drug decriminalization?','Walk me through climate liability law.'];

  return `
    <div class="lawyer-empty">
      <div class="lawyer-empty-inner">
        <div class="lawyer-avatar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
        </div>
        <h1 class="lawyer-heading">Legal AI Advisor</h1>
        <p class="lawyer-subheading">Ask me anything about law \u2014 case precedents, statutory frameworks, or debate arguments.</p>
        <div class="suggested-questions">
          ${suggestions.map(q => `<button class="suggested-question">${q}</button>`).join('')}
        </div>
        <div class="chat-input-box">
          <div style="padding:12px 14px 0;">
            <textarea class="chat-textarea" rows="1" placeholder="Ask anything about law\u2026"></textarea>
          </div>
          <div class="chat-toolbar">
            <div class="chat-toolbar-left">
              <button class="chat-attach-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </button>
              <button class="chat-context-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                Context
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>
            <button class="chat-send-btn disabled">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </div>
        </div>
        <p class="chat-disclaimer">For research and argument support only \u2014 not legal advice.</p>
      </div>
    </div>
  `;
}
