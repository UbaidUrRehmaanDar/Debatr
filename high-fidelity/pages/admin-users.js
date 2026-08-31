function renderAdminUsers() {
  const USERS = [
    { name: 'Sarah Chen', email: 'sarah.chen@example.com', role: 'Admin', verified: true, joined: 'Jan 2026', avatar: 'SC', bg: 'var(--notion-accent-purple)', color: 'var(--notion-accent-purple-deep)' },
    { name: 'Marcus Johnson', email: 'marcus.j@example.com', role: 'Member', verified: true, joined: 'Feb 2026', avatar: 'MJ', bg: 'var(--notion-accent-sky)', color: '#fff' },
    { name: 'Emily Rodriguez', email: 'emily.r@example.com', role: 'Member', verified: true, joined: 'Mar 2026', avatar: 'ER', bg: 'var(--notion-accent-teal)', color: '#fff' },
    { name: 'David Kim', email: 'david.kim@example.com', role: 'Member', verified: false, joined: 'Apr 2026', avatar: 'DK', bg: 'var(--notion-accent-green)', color: '#fff' },
    { name: 'Lisa Wang', email: 'lisa.w@example.com', role: 'Editor', verified: true, joined: 'May 2026', avatar: 'LW', bg: 'var(--notion-accent-orange)', color: '#fff' },
  ];

  return `
    <div class="page-content">
      <button class="btn btn-ghost btn-sm" style="margin-bottom:24px;" onclick="navigate('admin')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Back to Admin
      </button>

      <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px;">
        <div style="width:56px;height:56px;border-radius:14px;background:var(--notion-accent-sky);display:flex;align-items:center;justify-content:center;color:#fff;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div>
          <h1 style="font-size:28px;font-weight:500;letter-spacing:-0.03em;margin:0 0 4px 0;color:var(--foreground);">User Management</h1>
          <p style="font-size:14px;color:var(--muted-foreground);margin:0;">24 total users</p>
        </div>
      </div>

      <div style="position:relative;margin-bottom:24px;">
        <div style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted-foreground);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <input class="form-input" type="text" placeholder="Search users by name or email..." style="padding-left:42px;" />
      </div>

      <div class="admin-table">
        <div class="admin-table-header" style="grid-template-columns:1fr 120px 120px 100px;">
          <span>User</span><span>Role</span><span>Status</span><span style="text-align:right;">Joined</span>
        </div>
        ${USERS.map(u => `
          <div class="admin-table-row" style="grid-template-columns:1fr 120px 120px 100px;">
            <div style="display:flex;align-items:center;gap:14px;">
              <div style="width:40px;height:40px;border-radius:50%;background:${u.bg};display:flex;align-items:center;justify-content:center;color:${u.color};font-size:13px;font-weight:600;flex-shrink:0;">${u.avatar}</div>
              <div>
                <div style="font-size:13.5px;font-weight:500;color:var(--foreground);margin-bottom:2px;">${u.name}</div>
                <div style="font-size:12px;color:var(--muted-foreground);">${u.email}</div>
              </div>
            </div>
            <span class="badge badge-neutral">${u.role}</span>
            <span class="badge ${u.verified?'badge-success':'badge-neutral'}">${u.verified?'Verified':'Unverified'}</span>
            <span style="font-size:12px;color:var(--muted-foreground);text-align:right;">${u.joined}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
