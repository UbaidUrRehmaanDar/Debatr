const NAV_LINKS = [
  { label: 'Debates', href: '/debates' },
  { label: 'New', href: '/debates/new' },
  { label: 'Import', href: '/import' },
  { label: 'Insights', href: '/insights' },
  { label: 'Legal AI', href: '/legal-ai' },
];

export function renderNav(currentPath = '/', user = null) {
  const links = NAV_LINKS.map((link) => {
    const isActive = currentPath === link.href || currentPath.startsWith(link.href + '/');
    const style = isActive
      ? 'color:#2563eb;font-weight:600;border-bottom:2px solid #2563eb;'
      : 'color:#64748b;font-weight:500;border-bottom:2px solid transparent;';
    return `<a href="${link.href}" style="padding:8px 0;text-decoration:none;font-size:14px;transition:color 0.15s;${style}">${link.label}</a>`;
  }).join('');

  const searchBtn = `
    <button onclick="document.getElementById('global-search')?.focus()" style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;padding:8px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;color:#94a3b8;font-size:13px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      Search
      <kbd style="background:#e2e8f0;padding:2px 6px;border-radius:4px;font-size:11px;color:#64748b;">⌘K</kbd>
    </button>`;

  const userChip = user
    ? `<div style="display:flex;align-items:center;gap:10px;">
        <div style="width:32px;height:32px;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;">${(user.name || user.email || 'U').charAt(0).toUpperCase()}</div>
        <span style="font-size:14px;font-weight:500;color:#0f172a;">${user.name || user.email}</span>
      </div>`
    : `<a href="/login" style="padding:8px 16px;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none;font-size:14px;font-weight:600;">Sign In</a>`;

  return `
    <nav style="background:#fff;border-bottom:1px solid #e2e8f0;padding:0 24px;position:sticky;top:0;z-index:100;">
      <div style="max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:60px;">
        <div style="display:flex;align-items:center;gap:32px;">
          <a href="/" style="display:flex;align-items:center;gap:8px;text-decoration:none;">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="8" fill="#2563eb"/><path d="M8 10h12M8 14h8M8 18h10" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>
            <span style="font-size:18px;font-weight:800;color:#0f172a;">Debatr</span>
          </a>
          <div style="display:flex;align-items:center;gap:24px;">${links}</div>
        </div>
        <div style="display:flex;align-items:center;gap:16px;">
          ${searchBtn}
          ${userChip}
        </div>
      </div>
    </nav>`;
}
