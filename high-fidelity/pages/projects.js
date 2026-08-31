function renderProjects() {
  const PROJECTS = [
    { id: 1, name: 'AI Ethics Research', desc: 'Multi-round debate series on artificial intelligence governance and ethics.', debates: 5, members: 3, updated: 'Today', icon: '\uD83E\uDD16', color: '#065F46' },
    { id: 2, name: 'Climate Policy Brief', desc: 'Policy analysis and argumentation on climate change legislation.', debates: 3, members: 2, updated: 'Yesterday', icon: '\uD83C\uDF0D', color: '#059669' },
    { id: 3, name: 'Legal Precedent Study', desc: 'Research debates on key legal precedents in constitutional law.', debates: 8, members: 4, updated: '3 days ago', icon: '\u2696\uFE0F', color: '#1E40AF' },
    { id: 4, name: 'Future of Work', desc: 'Examining automation, remote work, and the changing nature of employment.', debates: 2, members: 2, updated: '5 days ago', icon: '\uD83D\uDCBC', color: '#7C3AED' },
    { id: 5, name: 'Digital Rights', desc: 'Privacy, data ownership, surveillance, and digital civil liberties.', debates: 3, members: 3, updated: '1 week ago', icon: '\uD83D\uDD12', color: '#DC2626' },
    { id: 6, name: 'Economics & Society', desc: 'Debating economic systems, social policy, wealth inequality, and capitalism.', debates: 4, members: 3, updated: '2 weeks ago', icon: '\uD83D\uDCB0', color: '#92400E' },
  ];

  return `
    <div class="page-content">
      <div class="debates-top">
        <div class="page-header"><h1>Projects</h1><p>Organize debates into project folders.</p></div>
        <button class="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          New Project
        </button>
      </div>
      <div class="project-grid">
        ${PROJECTS.map(p => `
          <div class="project-card">
            <div class="project-card-header">
              <span class="project-card-name">${p.name}</span>
              <span class="badge badge-neutral">${p.debates} debates</span>
            </div>
            <div class="project-card-desc">${p.desc}</div>
            <div class="project-card-meta">
              <span>${p.members} members</span>
              <span>Updated ${p.updated}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
