function renderInvitations() {
  const INVITATIONS = [
    { email: 'newuser@example.com', role: 'Member', sent: '2 days ago', status: 'Pending', avatar: 'N' },
    { email: 'colleague@team.io', role: 'Editor', sent: '1 week ago', status: 'Accepted', avatar: 'C' },
    { email: 'reviewer@org.com', role: 'Viewer', sent: '3 weeks ago', status: 'Expired', avatar: 'R' },
  ];

  return `
    <div class="page-content">
      <div class="debates-top">
        <div class="page-header"><h1>Invitations</h1><p>Track and manage pending invitations.</p></div>
        <button class="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Send Invitation
        </button>
      </div>
      <div class="admin-table">
        <div class="admin-table-header" style="grid-template-columns:1fr 100px 100px 100px;">
          <span>Email</span><span>Role</span><span>Sent</span><span>Status</span>
        </div>
        ${INVITATIONS.map(i => `
          <div class="admin-table-row" style="grid-template-columns:1fr 100px 100px 100px;">
            <span class="admin-table-cell">${i.email}</span>
            <span class="badge badge-neutral">${i.role}</span>
            <span class="admin-table-cell-muted">${i.sent}</span>
            <span class="badge ${i.status==='Accepted'?'badge-success':i.status==='Pending'?'badge-warning':'badge-danger'}">${i.status}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
