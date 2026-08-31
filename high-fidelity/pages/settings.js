function renderSettings() {
  return `
    <div class="page-content">
      <div class="page-header"><h1>Settings</h1><p>Manage your account and application preferences.</p></div>
      <div class="settings-layout">
        <div class="settings-nav">
          ${['Profile','Appearance','Notifications','Security','Billing'].map((s,i) => `<button class="settings-nav-item${i===0?' active':''}">${s}</button>`).join('')}
        </div>
        <div class="settings-section">
          <div class="settings-section-title">Profile</div>
          <div style="display:flex;align-items:center;gap:24px;margin-bottom:24px;">
            <div style="position:relative;width:80px;height:80px;flex-shrink:0;">
              <div style="width:80px;height:80px;border-radius:50%;background:var(--notion-accent-purple);display:flex;align-items:center;justify-content:center;color:var(--notion-accent-purple-deep);font-size:28px;font-weight:600;">AM</div>
              <button style="position:absolute;bottom:0;right:0;width:28px;height:28px;border-radius:50%;background:var(--primary);border:2px solid var(--background);display:flex;align-items:center;justify-content:center;color:var(--primary-foreground);cursor:pointer;border:none;" title="Upload photo">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Display Name</label>
            <input class="form-input" value="Alex Morgan" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" value="alex@debatr.io" />
          </div>
          <div class="form-group">
            <label class="form-label">Bio</label>
            <textarea class="form-input form-textarea" placeholder="Tell us about yourself..."></textarea>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-label">Dark Mode</div><div class="settings-row-desc">Switch to dark theme</div></div>
            <div class="toggle" id="darkToggle" onclick="document.documentElement.classList.toggle('dark');this.classList.toggle('active')"></div>
          </div>
          <div class="form-actions" style="margin-top:var(--space-md);">
            <button class="btn btn-primary">Save Changes</button>
            <button class="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
