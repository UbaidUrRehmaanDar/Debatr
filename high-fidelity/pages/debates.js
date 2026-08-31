function renderDebates() {
  const dot = s => s === 'Won' ? 'won' : s === 'Lost' ? 'lost' : 'ongoing';
  const debates = [
    { id: 1,  title: 'Should AI Replace Teachers?',      status: 'Won',     score: 84, opp: 'Sarah Khan',   date: 'Today',       topic: 'Education' },
    { id: 2,  title: 'Universal Basic Income',            status: 'Lost',    score: 71, opp: 'James Okafor', date: 'Yesterday',   topic: 'Economics' },
    { id: 3,  title: 'Nuclear Energy and Climate Change', status: 'Won',     score: 88, opp: 'Priya Mehta',  date: '3 days ago',  topic: 'Policy' },
    { id: 4,  title: 'Social Media Regulation',           status: 'Won',     score: 79, opp: 'Tom Bremer',   date: '5 days ago',  topic: 'Technology' },
    { id: 5,  title: 'Drug Decriminalization Policy',     status: 'Lost',    score: 67, opp: 'Nina Vorosch', date: '1 week ago',  topic: 'Law' },
    { id: 6,  title: 'Autonomous Weapons in Warfare',     status: 'Won',     score: 91, opp: 'Daniel Park',  date: '2 weeks ago', topic: 'Ethics' },
    { id: 7,  title: 'Climate Reparations',               status: 'Ongoing', score: null, opp: 'Aisha Cole', date: 'In progress', topic: 'Policy' },
  ];

  return `
    <div class="page-content">
      <div class="debates-top">
        <div class="page-header"><h1>Debates</h1><p>Your complete debate history and active sessions.</p></div>
        <button class="btn btn-primary" onclick="navigate('new')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          New Debate
        </button>
      </div>
      <div style="border-top:1px solid var(--border);">
        <div class="debates-table-header"><span>Debate</span><span>Status</span><span>Score</span><span style="text-align:right">Opponent</span><span style="text-align:right">Date</span></div>
        ${debates.map(d => `<div class="debate-row"><div><div class="debate-row-title">${d.title}</div><div class="debate-row-topic">${d.topic}</div></div><div class="debate-row-status"><span class="status-dot ${dot(d.status)}"></span>${d.status}</div><div class="debate-row-score${d.score===null?' empty':''}">${d.score!==null?d.score:'\u2014'}</div><div class="debate-row-opp">${d.opp}</div><div class="debate-row-date">${d.date}</div></div>`).join('')}
      </div>
    </div>
  `;
}
