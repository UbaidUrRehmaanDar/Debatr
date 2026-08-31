function renderAdmin() {
  const USERS = [
    { id: 1, name: 'Alex Morgan',    email: 'alex@debatr.io',     role: 'Admin',   avatar: 'A' },
    { id: 2, name: 'Sarah Khan',     email: 'sarah@debatr.io',    role: 'Member',  avatar: 'S' },
    { id: 3, name: 'James Okafor',   email: 'james@debatr.io',    role: 'Member',  avatar: 'J' },
    { id: 4, name: 'Priya Mehta',    email: 'priya@debatr.io',    role: 'Editor',  avatar: 'P' },
    { id: 5, name: 'Tom Bremer',     email: 'tom@debatr.io',      role: 'Member',  avatar: 'T' },
  ];

  return `
    <div class="page-content">
      <div class="page-header"><h1>Admin</h1><p>Manage users, roles, and system settings.</p></div>
      <div class="admin-table">
        <div class="admin-table-header" style="grid-template-columns:40px 1fr 100px 100px auto;">
          <span></span><span>User</span><span>Role</span><span>Status</span><span></span>
        </div>
        ${USERS.map(u => `
          <div class="admin-table-row" style="grid-template-columns:40px 1fr 100px 100px auto;">
            <div class="team-avatar" style="background:var(--notion-accent-purple);color:var(--notion-accent-purple-deep);">${u.avatar}</div>
            <div class="admin-table-cell">
              <div style="font-weight:500;">${u.name}</div>
              <div class="admin-table-cell-muted">${u.email}</div>
            </div>
            <span class="badge badge-neutral">${u.role}</span>
            <span class="badge badge-success">Active</span>
            <div class="admin-table-actions">
              <button class="btn btn-ghost btn-icon-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
