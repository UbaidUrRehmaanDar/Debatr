// ══════════════════════════════════════════════════════════════════════════════
// Debatr SPA — app.js
// ══════════════════════════════════════════════════════════════════════════════

// ─── Route Definitions ──────────────────────────────────────────────────────
const ROUTES = [
  { key: 'debates',      label: 'Debates',      nav: true  },
  { key: 'new',          label: 'New Debate',    nav: true  },
  { key: 'import',       label: 'Import',        nav: true  },
  { key: 'insights',     label: 'Insights',      nav: true  },
  { key: 'lawyer',       label: 'Legal AI',      nav: true  },
  { key: 'templates',    label: 'Templates',     nav: true  },
  { key: 'settings',     label: 'Settings',      nav: false },
  { key: 'admin',        label: 'Admin',         nav: false },
  { key: 'analytics',    label: 'Analytics',     nav: false },
  { key: 'projects',     label: 'Projects',      nav: false },
  { key: 'users',        label: 'Users',         nav: false },
  { key: 'invitations',  label: 'Invitations',   nav: false },
  { key: 'profile',      label: 'Profile',       nav: false },
  { key: 'help',         label: 'Help',          nav: false },
  { key: 'feedback',     label: 'Feedback',      nav: false },
  { key: 'privacy',      label: 'Privacy',       nav: false },
  { key: 'terms',        label: 'Terms',         nav: false },
  { key: 'changelog',    label: 'Changelog',     nav: false },
  { key: 'integrations', label: 'Integrations',  nav: false },
  { key: 'billing',      label: 'Billing',       nav: false },
  { key: 'team',         label: 'Team',          nav: false },
  { key: 'reports',      label: 'Reports',       nav: false },
];

const NAV_LINKS = ROUTES.filter(r => r.nav);

// ─── Page Module Registry ────────────────────────────────────────────────────
const PAGE_MODULES = {
  debates:      renderDebates,
  new:          renderDebateNew,
  import:       renderImport,
  insights:     renderAnalytics,
  lawyer:       renderLegalAi,
  templates:    null,
  settings:     renderSettings,
  admin:        renderAdmin,
  analytics:    renderAnalytics,
  projects:     renderProjects,
  users:        renderAdminUsers,
  invitations:  renderInvitations,
  profile:      null,
  help:         renderHelp,
  feedback:     null,
  privacy:      renderPrivacy,
  terms:        renderTerms,
  changelog:    null,
  integrations: null,
  billing:      null,
  team:         null,
  reports:      null,
  'sign-in':    renderSignIn,
  'sign-up':    renderSignUp,
  'forgot-password': renderForgotPassword,
  'reset-password':  renderResetPassword,
  'verify-email':    renderVerifyEmail,
  'debate-detail':   renderDebateDetail,
  'debate-report':   renderDebateReport,
  'debate-spectate': renderDebateSpectate,
  'admin-users':     renderAdminUsers,
};

// ─── Mock Data Stores ───────────────────────────────────────────────────────
const DEBATES_LIST = [
  { id: 1,  title: 'Should AI Replace Teachers?',      status: 'Won',     score: 84, opp: 'Sarah Khan',   date: 'Today',       topic: 'Education' },
  { id: 2,  title: 'Universal Basic Income',            status: 'Lost',    score: 71, opp: 'James Okafor', date: 'Yesterday',   topic: 'Economics' },
  { id: 3,  title: 'Nuclear Energy and Climate Change', status: 'Won',     score: 88, opp: 'Priya Mehta',  date: '3 days ago',  topic: 'Policy' },
  { id: 4,  title: 'Social Media Regulation',           status: 'Won',     score: 79, opp: 'Tom Bremer',   date: '5 days ago',  topic: 'Technology' },
  { id: 5,  title: 'Drug Decriminalization Policy',     status: 'Lost',    score: 67, opp: 'Nina Vorosch', date: '1 week ago',  topic: 'Law' },
  { id: 6,  title: 'Autonomous Weapons in Warfare',     status: 'Won',     score: 91, opp: 'Daniel Park',  date: '2 weeks ago', topic: 'Ethics' },
  { id: 7,  title: 'Climate Reparations',               status: 'Ongoing', score: null, opp: 'Aisha Cole', date: 'In progress', topic: 'Policy' },
];

const USERS = [
  { id: 1, name: 'Alex Morgan',    email: 'alex@debatr.io',     role: 'Admin',   avatar: 'A' },
  { id: 2, name: 'Sarah Khan',     email: 'sarah@debatr.io',    role: 'Member',  avatar: 'S' },
  { id: 3, name: 'James Okafor',   email: 'james@debatr.io',    role: 'Member',  avatar: 'J' },
  { id: 4, name: 'Priya Mehta',    email: 'priya@debatr.io',    role: 'Editor',  avatar: 'P' },
  { id: 5, name: 'Tom Bremer',     email: 'tom@debatr.io',      role: 'Member',  avatar: 'T' },
];

const TEMPLATES = [
  { id: 1, name: 'Oxford Classic',    desc: 'Standard proposition vs. opposition format', icon: '\u2696\uFE0F', category: 'Debate' },
  { id: 2, name: 'Lincoln-Douglas',   desc: 'Value-based two-person debate',             icon: '\uD83C\uDFF5', category: 'Debate' },
  { id: 3, name: 'Policy Analysis',   desc: 'In-depth policy evaluation framework',      icon: '\uD83D\uDCCB', category: 'Analysis' },
  { id: 4, name: 'Legal Brief',       desc: 'Structured legal argument template',        icon: '\uD83D\uDCDC', category: 'Legal' },
  { id: 5, name: 'Persuasive Essay',  desc: 'Five-paragraph persuasive structure',       icon: '\u270D\uFE0F', category: 'Writing' },
  { id: 6, name: 'Socratic Method',   desc: 'Question-driven inquiry format',            icon: '\uD83D\uDCD6', category: 'Discussion' },
];

const INVITATIONS = [
  { id: 1, email: 'newuser@example.com', role: 'Member', sent: '2 days ago',  status: 'Pending' },
  { id: 2, email: 'colleague@team.io',   role: 'Editor', sent: '1 week ago',  status: 'Accepted' },
  { id: 3, email: 'reviewer@org.com',    role: 'Viewer', sent: '3 weeks ago', status: 'Expired' },
];

const PROJECTS = [
  { id: 1, name: 'AI Ethics Research',   desc: 'Multi-round debate series on artificial intelligence governance and ethics.', debates: 5, members: 3, updated: 'Today' },
  { id: 2, name: 'Climate Policy Brief',  desc: 'Policy analysis and argumentation on climate change legislation.',         debates: 3, members: 2, updated: 'Yesterday' },
  { id: 3, name: 'Legal Precedent Study', desc: 'Research debates on key legal precedents in constitutional law.',          debates: 8, members: 4, updated: '3 days ago' },
];

const ANALYTICS = {
  totalDebates: 18,
  winRate: 72,
  avgScore: 81,
  rating: 1540,
  ratingDelta: 160,
  monthlyGrowth: [12, 8, 15, 10, 18, 14, 20, 16, 22, 19, 25, 21],
  topTopics: ['Policy', 'Ethics', 'Technology', 'Law'],
};

// ─── SVG Icons ──────────────────────────────────────────────────────────────
const ICONS = {
  search: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  upload: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
  message: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  send: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  scale: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',
  scaleSmall: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>',
  chevronRight: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  chevronDown: '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  check: '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  refreshCw: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
  settings: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
  trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
};

// ─── State ──────────────────────────────────────────────────────────────────
let currentPage = 'debates';
let searchOpen = false;
let avatarOpen = false;
let toasts = [];
let toastId = 0;

// ─── Utility Functions ──────────────────────────────────────────────────────
function formatDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatTime(d) {
  if (!(d instanceof Date)) d = new Date(d);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Toast System ───────────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3000) {
  const id = ++toastId;
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.id = `toast-${id}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>
    <button class="toast-close" onclick="removeToast(${id})">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>`;

  container.appendChild(toast);
  toasts.push(id);

  setTimeout(() => removeToast(id), duration);
}

function removeToast(id) {
  const el = document.getElementById(`toast-${id}`);
  if (!el) return;
  el.classList.add('removing');
  setTimeout(() => { el.remove(); toasts = toasts.filter(t => t !== id); }, 200);
}

// ─── Navigation ─────────────────────────────────────────────────────────────
function navigate(page) {
  currentPage = page;
  renderNav();
  renderPage();
  window.scrollTo(0, 0);
}

function renderNav() {
  const container = document.getElementById('navLinks');
  if (!container) return;
  container.innerHTML = NAV_LINKS.map(({ key, label }) =>
    `<button class="nav-link${currentPage === key ? ' active' : ''}" data-nav="${key}">${label}</button>`
  ).join('');
}

// ─── Page Rendering ─────────────────────────────────────────────────────────
function renderPage() {
  const container = document.getElementById('pageContainer');
  if (!container) return;
  container.className = 'page-enter';
  container.style.opacity = '0';
  requestAnimationFrame(() => { container.style.opacity = ''; });

  const moduleRenderer = PAGE_MODULES[currentPage];
  const inlineRenderer = PAGE_RENDERERS[currentPage];
  const renderer = moduleRenderer || inlineRenderer || PAGE_RENDERERS._404;
  container.innerHTML = renderer();

  if (typeof window[`setup_${currentPage}`] === 'function') {
    window[`setup_${currentPage}`]();
  }
}

const PAGE_RENDERERS = {
  debates() {
    const dot = s => s === 'Won' ? 'won' : s === 'Lost' ? 'lost' : 'ongoing';
    return `<div class="page-content">
      <div class="debates-top">
        <div class="page-header"><h1>Debates</h1><p>Your complete debate history and active sessions.</p></div>
        <button class="btn btn-primary" onclick="navigate('new')">${ICONS.plus} New Debate</button>
      </div>
      <div style="border-top:1px solid var(--border);">
        <div class="debates-table-header"><span>Debate</span><span>Status</span><span>Score</span><span style="text-align:right">Opponent</span><span style="text-align:right">Date</span></div>
        ${DEBATES_LIST.map(d => `<div class="debate-row"><div><div class="debate-row-title">${d.title}</div><div class="debate-row-topic">${d.topic}</div></div><div class="debate-row-status"><span class="status-dot ${dot(d.status)}"></span>${d.status}</div><div class="debate-row-score${d.score===null?' empty':''}">${d.score!==null?d.score:'\u2014'}</div><div class="debate-row-opp">${d.opp}</div><div class="debate-row-date">${d.date}</div></div>`).join('')}
      </div></div>`;
  },
  new() {
    return `<div class="page-content-narrow"><div class="page-header"><h1>New Debate</h1><p>Define your topic and configure the debate session.</p></div>
      <div class="new-debate-form">
        <div class="form-group"><label class="form-label">Debate Topic</label><input class="form-input" id="topicInput" type="text" placeholder="e.g. Artificial intelligence should be regulated" /></div>
        <div class="form-group"><label class="form-label">Category</label><div class="topic-tags">${['Education','Economics','Policy','Technology','Law','Ethics'].map(t=>`<button class="topic-tag" data-topic="${t}">${t}</button>`).join('')}</div></div>
        <div class="form-group"><label class="form-label">Format</label><div class="format-grid">${[{k:'oxford',l:'Oxford',s:'Classic proposition vs. opposition'},{k:'lincoln',l:'Lincoln-Douglas',s:'Value-based, two-person'},{k:'open',l:'Open Format',s:'Flexible structure'}].map(f=>`<button class="format-card" data-format="${f.k}"><div class="format-card-title">${f.l}</div><div class="format-card-sub">${f.s}</div></button>`).join('')}</div></div>
        <div class="form-group"><label class="form-label">Rounds</label><div class="rounds-row">${['4','6','8','10'].map(r=>`<button class="round-btn" data-rounds="${r}">${r}</button>`).join('')}</div></div>
        <div class="form-divider"></div>
        <div class="form-actions"><button class="btn btn-primary btn-lg">Start Debate</button><button class="btn btn-cancel btn-lg" onclick="navigate('debates')">Cancel</button></div>
      </div></div>`;
  },
  import() {
    return `<div class="page-content-narrow"><div class="page-header"><h1>Import Debate</h1><p>Upload an existing debate to continue working with it inside Debatr.</p></div>
      <div class="dropzone" id="dropzone"><div class="dropzone-icon">${ICONS.upload}</div><div class="dropzone-text"><span class="dropzone-title">Drop your file here</span><span class="dropzone-subtitle">or click to browse \u00b7 JSON, PDF, .debatr \u00b7 Max 25 MB</span></div></div>
      <input type="file" id="fileInput" accept=".json,.pdf,.debatr" style="display:none;" />
      <div class="form-divider" style="margin:var(--space-xxl) 0;"></div>
      <div class="form-actions"><button class="btn btn-primary btn-lg" disabled>Import Debate</button><button class="btn btn-cancel btn-lg" onclick="navigate('debates')">Cancel</button></div></div>`;
  },
  insights() {
    const stats = [{l:'Total Debates',v:'18',s:'all time'},{l:'Win Rate',v:'72%',s:'13 wins \u00b7 5 losses'},{l:'Avg. Judge Score',v:'81',s:'out of 100'},{l:'Current Rating',v:'1540',s:'+160 since January'}];
    return `<div class="page-content"><div class="insights-header"><h1 style="font-size:28px;font-weight:500;letter-spacing:-0.03em;margin:0 0 8px 0;">Analytics</h1><p style="font-size:14px;color:var(--muted-foreground);margin:0;">Review your debating activity and progress.</p></div>
      <div class="insights-sections">
        <div class="section"><div class="section-header"><h2 class="section-title">Overview</h2><div class="section-line"></div></div><div class="insights-grid">${stats.map(m=>`<div class="insight-stat"><div class="insight-value">${m.v}</div><div class="insight-label">${m.l}</div><div class="insight-sub">${m.s}</div></div>`).join('')}</div></div>
        <div class="section"><div class="section-header"><h2 class="section-title">Strengths</h2><div class="section-line"></div></div><div class="strengths-list">${[{l:'Logic',s:87},{l:'Evidence',s:74},{l:'Rebuttal',s:81},{l:'Clarity',s:90}].map(x=>`<div class="strength-row"><span class="strength-label">${x.l}</span><div class="strength-bar-bg"><div class="strength-bar-fill" style="width:${x.s}%"></div></div><span class="strength-score">${x.s}</span></div>`).join('')}</div></div>
      </div></div>`;
  },
  lawyer() {
    return `<div class="lawyer-empty"><div class="lawyer-empty-inner">
      <div class="lawyer-avatar">${ICONS.scale}</div>
      <h1 class="lawyer-heading">Legal AI Advisor</h1>
      <p class="lawyer-subheading">Ask me anything about law \u2014 case precedents, statutory frameworks, or debate arguments.</p>
      <div class="suggested-questions">${['What legal precedents support AI regulation?','How do I argue drug decriminalization?','Walk me through climate liability law.'].map(q=>`<button class="suggested-question">${q}</button>`).join('')}</div>
      <div class="chat-input-box"><div style="padding:12px 14px 0;"><textarea class="chat-textarea" rows="1" placeholder="Ask anything about law\u2026"></textarea></div><div class="chat-toolbar"><div class="chat-toolbar-left"><button class="chat-attach-btn">${ICONS.upload}</button><button class="chat-context-btn">${ICONS.message} Context ${ICONS.chevronDown}</button></div><button class="chat-send-btn disabled">${ICONS.send}</button></div></div>
      <p class="chat-disclaimer">For research and argument support only \u2014 not legal advice.</p>
    </div></div>`;
  },
  templates() {
    return `<div class="page-content"><div class="page-header"><h1>Templates</h1><p>Start from a structured template for your next debate or analysis.</p></div>
      <div class="template-grid">${TEMPLATES.map(t=>`<div class="template-card"><div class="template-card-icon">${t.icon}</div><div class="template-card-title">${t.name}</div><div class="template-card-desc">${t.desc}</div></div>`).join('')}</div></div>`;
  },
  settings() {
    return `<div class="page-content"><div class="page-header"><h1>Settings</h1><p>Manage your account and application preferences.</p></div>
      <div class="settings-layout"><div class="settings-nav">${['Profile','Appearance','Notifications','Security','Billing'].map((s,i)=>`<button class="settings-nav-item${i===0?' active':''}">${s}</button>`).join('')}</div>
      <div class="settings-section"><div class="settings-section-title">Profile</div>
        <div class="form-group"><label class="form-label">Display Name</label><input class="form-input" value="Alex Morgan" /></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-input" value="alex@debatr.io" /></div>
        <div class="settings-row"><div><div class="settings-row-label">Dark Mode</div><div class="settings-row-desc">Switch to dark theme</div></div><div class="toggle" id="darkToggle" onclick="document.documentElement.classList.toggle('dark');this.classList.toggle('active')"></div></div>
        <div class="form-actions" style="margin-top:var(--space-md)"><button class="btn btn-primary">Save Changes</button><button class="btn btn-secondary">Cancel</button></div>
      </div></div></div>`;
  },
  admin() {
    const cols = 'grid-template-columns: 40px 1fr 100px 100px auto';
    return `<div class="page-content"><div class="page-header"><h1>Admin</h1><p>Manage users, roles, and system settings.</p></div>
      <div class="admin-table"><div class="admin-table-header" style="${cols}"><span></span><span>User</span><span>Role</span><span>Status</span><span></span></div>
      ${USERS.map(u=>`<div class="admin-table-row" style="${cols}"><div class="team-avatar" style="background:var(--notion-accent-purple);color:var(--notion-accent-purple-deep)">${u.avatar}</div><div class="admin-table-cell"><div style="font-weight:500">${u.name}</div><div class="admin-table-cell-muted">${u.email}</div></div><span class="badge badge-neutral">${u.role}</span><span class="badge badge-success">Active</span><div class="admin-table-actions"><button class="btn btn-ghost btn-icon-sm">${ICONS.settings}</button></div></div>`).join('')}</div></div>`;
  },
  analytics() {
    return `<div class="page-content"><div class="page-header"><h1>Analytics</h1><p>Detailed analytics and performance metrics.</p></div>
      <div class="insights-grid" style="margin-bottom:var(--space-xxl)">${[{l:'Total Views',v:'1,247',s:'this month'},{l:'Active Users',v:'89',s:'this week'},{l:'Debates Created',v:'42',s:'this month'},{l:'Avg. Session',v:'18m',s:'per user'}].map(m=>`<div class="insight-stat"><div class="insight-value">${m.v}</div><div class="insight-label">${m.l}</div><div class="insight-sub">${m.s}</div></div>`).join('')}</div>
      <div class="section"><div class="section-header"><h2 class="section-title">Monthly Activity</h2><div class="section-line"></div></div><div class="chart-container" id="chartContainer"></div></div></div>`;
  },
  projects() {
    return `<div class="page-content"><div class="debates-top"><div class="page-header"><h1>Projects</h1><p>Organize debates into project folders.</p></div><button class="btn btn-primary">${ICONS.plus} New Project</button></div>
      <div class="project-grid">${PROJECTS.map(p=>`<div class="project-card"><div class="project-card-header"><span class="project-card-name">${p.name}</span><span class="badge badge-neutral">${p.debates} debates</span></div><div class="project-card-desc">${p.desc}</div><div class="project-card-meta"><span>${p.members} members</span><span>Updated ${p.updated}</span></div></div>`).join('')}</div></div>`;
  },
  users() {
    return `<div class="page-content"><div class="debates-top"><div class="page-header"><h1>Users</h1><p>Manage team members and their permissions.</p></div><button class="btn btn-primary">${ICONS.plus} Invite User</button></div>
      <div class="team-list">${USERS.map(u=>`<div class="team-member"><div class="team-avatar" style="background:var(--notion-accent-purple);color:var(--notion-accent-purple-deep)">${u.avatar}</div><div><div class="team-member-name">${u.name}</div><div class="team-member-email">${u.email}</div></div><span class="badge badge-neutral">${u.role}</span><button class="btn btn-ghost btn-sm">Edit</button></div>`).join('')}</div></div>`;
  },
  invitations() {
    return `<div class="page-content"><div class="debates-top"><div class="page-header"><h1>Invitations</h1><p>Track and manage pending invitations.</p></div><button class="btn btn-primary">${ICONS.plus} Send Invitation</button></div>
      <div class="admin-table"><div class="admin-table-header" style="grid-template-columns:1fr 100px 100px 100px"><span>Email</span><span>Role</span><span>Sent</span><span>Status</span></div>
      ${INVITATIONS.map(i=>`<div class="admin-table-row" style="grid-template-columns:1fr 100px 100px 100px"><span class="admin-table-cell">${i.email}</span><span class="badge badge-neutral">${i.role}</span><span class="admin-table-cell-muted">${i.sent}</span><span class="badge ${i.status==='Accepted'?'badge-success':i.status==='Pending'?'badge-warning':'badge-danger'}">${i.status}</span></div>`).join('')}</div></div>`;
  },
  profile() {
    return `<div class="page-content-narrow"><div class="page-header"><h1>Profile</h1><p>Your personal profile and activity summary.</p></div>
      <div class="card" style="display:flex;gap:var(--space-lg);align-items:center;margin-bottom:var(--space-xl)"><div class="team-avatar" style="width:64px;height:64px;font-size:24px;background:var(--notion-accent-purple);color:var(--notion-accent-purple-deep)">A</div><div><div style="font-size:18px;font-weight:500">Alex Morgan</div><div style="color:var(--muted-foreground);font-size:14px">alex@debatr.io</div><div style="margin-top:4px"><span class="badge badge-purple">Admin</span></div></div></div>
      <div class="form-group"><label class="form-label">Display Name</label><input class="form-input" value="Alex Morgan" /></div>
      <div class="form-group"><label class="form-label">Bio</label><textarea class="form-input form-textarea" placeholder="Tell us about yourself..."></textarea></div>
      <div class="form-actions" style="margin-top:var(--space-md)"><button class="btn btn-primary">Save Profile</button></div></div>`;
  },
  help() {
    return `<div class="page-content-narrow"><div class="page-header"><h1>Help Center</h1><p>Find answers and get support.</p></div>
      <div class="suggested-questions">${['How do I create a new debate?','What debate formats are supported?','How does the Legal AI work?','Can I import debates from other platforms?','How is my rating calculated?'].map(q=>`<button class="suggested-question">${q}</button>`).join('')}</div></div>`;
  },
  feedback() {
    return `<div class="page-content-narrow"><div class="page-header"><h1>Feedback</h1><p>Help us improve Debatr with your feedback.</p></div>
      <div class="form-group"><label class="form-label">Feedback Type</label><select class="form-input form-select"><option>Bug Report</option><option>Feature Request</option><option>General Feedback</option></select></div>
      <div class="form-group"><label class="form-label">Message</label><textarea class="form-input form-textarea" rows="6" placeholder="Describe your feedback..."></textarea></div>
      <div class="form-actions" style="margin-top:var(--space-md)"><button class="btn btn-primary">Submit Feedback</button></div></div>`;
  },
  privacy() {
    return `<div class="page-content-narrow"><div class="page-header"><h1>Privacy Policy</h1><p>Last updated: January 15, 2026</p></div>
      <div style="font-size:14px;line-height:1.8;color:var(--foreground)"><p style="margin-bottom:var(--space-md)">We respect your privacy. This policy describes how we collect, use, and protect your personal information.</p>
      <h3 style="font-size:16px;font-weight:500;margin:var(--space-lg) 0 var(--space-xs)">Information We Collect</h3><p style="margin-bottom:var(--space-md)">We collect information you provide directly, such as your name, email address, and debate content.</p>
      <h3 style="font-size:16px;font-weight:500;margin:var(--space-lg) 0 var(--space-xs)">How We Use It</h3><p>We use your information to provide and improve our services, personalize your experience, and communicate with you.</p></div></div>`;
  },
  terms() {
    return `<div class="page-content-narrow"><div class="page-header"><h1>Terms of Service</h1><p>Last updated: January 15, 2026</p></div>
      <div style="font-size:14px;line-height:1.8;color:var(--foreground)"><p style="margin-bottom:var(--space-md)">By using Debatr, you agree to these terms. Please read them carefully.</p>
      <h3 style="font-size:16px;font-weight:500;margin:var(--space-lg) 0 var(--space-xs)">Acceptable Use</h3><p style="margin-bottom:var(--space-md)">You may use Debatr for lawful purposes only. Do not use the platform to harass, bully, or harm others.</p>
      <h3 style="font-size:16px;font-weight:500;margin:var(--space-lg) 0 var(--space-xs)">Account Responsibility</h3><p>You are responsible for maintaining the security of your account and all activities under it.</p></div></div>`;
  },
  changelog() {
    const releases = [{v:'2.4.0',d:'Today',items:['Added Legal AI advisor','New template system','Improved search']},{v:'2.3.0',d:'1 week ago',items:['Import debates from PDF','Performance improvements']},{v:'2.2.0',d:'3 weeks ago',items:['Analytics dashboard','Team collaboration features']}];
    return `<div class="page-content-narrow"><div class="page-header"><h1>Changelog</h1><p>What's new in Debatr.</p></div>
      ${releases.map(r=>`<div style="margin-bottom:var(--space-xxl)"><div style="display:flex;gap:var(--space-sm);align-items:baseline;margin-bottom:var(--space-sm)"><span style="font-size:18px;font-weight:500">v${r.v}</span><span class="badge badge-neutral">${r.d}</span></div><ul style="list-style:disc;padding-left:var(--space-lg);display:flex;flex-direction:column;gap:4px">${r.items.map(i=>`<li style="font-size:14px;color:var(--foreground)">${i}</li>`).join('')}</ul></div>`).join('')}</div>`;
  },
  integrations() {
    return `<div class="page-content"><div class="page-header"><h1>Integrations</h1><p>Connect Debatr with your favorite tools.</p></div>
      <div class="template-grid">${[{n:'Google Drive',d:'Import documents from Google Drive',i:'\uD83D\uDDC4\uFE0F'},{n:'Slack',d:'Get debate notifications in Slack',i:'\uD83D\uDCAC'},{n:'Zapier',d:'Automate workflows with Zapier',i:'\u26A1'},{n:'GitHub',d:'Link debates to GitHub issues',i:'\uD83D\uDCE6'}].map(x=>`<div class="template-card"><div class="template-card-icon">${x.i}</div><div class="template-card-title">${x.n}</div><div class="template-card-desc">${x.d}</div></div>`).join('')}</div></div>`;
  },
  billing() {
    return `<div class="page-content-narrow"><div class="page-header"><h1>Billing</h1><p>Manage your subscription and payment methods.</p></div>
      <div class="card" style="margin-bottom:var(--space-xl)"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:18px;font-weight:500">Pro Plan</div><div style="font-size:14px;color:var(--muted-foreground)">$12/month \u00b7 Renews Feb 15, 2026</div></div><span class="badge badge-success">Active</span></div></div>
      <div class="form-group"><label class="form-label">Payment Method</label><div class="card" style="display:flex;justify-content:space-between;align-items:center"><span>Visa ending in 4242</span><button class="btn btn-ghost btn-sm">Update</button></div></div></div>`;
  },
  team() {
    return `<div class="page-content"><div class="debates-top"><div class="page-header"><h1>Team</h1><p>Manage your team members and roles.</p></div><button class="btn btn-primary">${ICONS.plus} Invite Member</button></div>
      <div class="team-list">${USERS.map(u=>`<div class="team-member"><div class="team-avatar" style="background:var(--notion-accent-purple);color:var(--notion-accent-purple-deep)">${u.avatar}</div><div><div class="team-member-name">${u.name}</div><div class="team-member-email">${u.email}</div></div><span class="badge badge-neutral">${u.role}</span><button class="btn btn-ghost btn-sm">Manage</button></div>`).join('')}</div></div>`;
  },
  reports() {
    return `<div class="page-content"><div class="page-header"><h1>Reports</h1><p>Generate and view debate performance reports.</p></div>
      <div class="project-grid">${[{n:'Win Rate Report',d:'Detailed breakdown of wins and losses over time.'},{n:'Topic Analysis',d:'Performance analysis by debate topic.'},{n:'Strength Assessment',d:'AI-powered assessment of your argumentation strengths.'},{n:'Monthly Summary',d:'Overview of all activity for the current month.'}].map(r=>`<div class="project-card"><div class="project-card-name">${r.n}</div><div class="project-card-desc">${r.d}</div><div style="margin-top:var(--space-md)"><button class="btn btn-secondary btn-sm">Generate</button></div></div>`).join('')}</div></div>`;
  },
  _404() {
    return `<div class="page-content"><div class="empty-state"><div class="empty-state-icon">${ICONS.search}</div><div class="empty-state-title">Page Not Found</div><div class="empty-state-desc">The page you're looking for doesn't exist.</div><button class="btn btn-primary" onclick="navigate('debates')">Go to Debates</button></div></div>`;
  },
};

// ─── Search ─────────────────────────────────────────────────────────────────
function openSearch() {
  searchOpen = true;
  const overlay = document.getElementById('searchOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
    const input = document.getElementById('searchInput');
    if (input) { input.value = ''; setTimeout(() => input.focus(), 50); renderSearchResults(''); }
  }
}

function closeSearch() {
  searchOpen = false;
  const overlay = document.getElementById('searchOverlay');
  if (overlay) overlay.style.display = 'none';
}

function renderSearchResults(query) {
  const container = document.getElementById('searchResults');
  if (!container) return;
  const items = ROUTES.filter(r => r.label.toLowerCase().includes(query.toLowerCase()));
  const debateResults = DEBATES_LIST.filter(d => d.title.toLowerCase().includes(query.toLowerCase()));
  let html = items.slice(0, 5).map(r => `<div class="search-result-item" data-nav="${r.key}">${ICONS.message}<span class="search-result-title">${r.label}</span><span class="search-result-topic">Page</span></div>`).join('');
  html += debateResults.slice(0, 3).map(d => `<div class="search-result-item">${ICONS.message}<span class="search-result-title">${d.title}</span><span class="search-result-topic">${d.topic}</span></div>`).join('');
  container.innerHTML = html || '<div style="padding:16px;text-align:center;color:var(--muted-foreground);font-size:13px;">No results found</div>';
}

// ─── Event Delegation ──────────────────────────────────────────────────────
document.addEventListener('click', (e) => {
  // Nav links
  const navBtn = e.target.closest('[data-nav]');
  if (navBtn) { navigate(navBtn.dataset.nav); return; }

  // Search result navigation
  const searchItem = e.target.closest('.search-result-item[data-nav]');
  if (searchItem) { closeSearch(); navigate(searchItem.dataset.nav); return; }

  // Avatar menu
  if (e.target.closest('.avatar-btn')) { avatarOpen = !avatarOpen; const m = document.getElementById('avatarMenu'); if (m) m.style.display = avatarOpen ? 'block' : 'none'; return; }
  if (avatarOpen && !e.target.closest('[data-avatar-root]')) { avatarOpen = false; const m = document.getElementById('avatarMenu'); if (m) m.style.display = 'none'; }

  // Topic tags
  const tag = e.target.closest('[data-topic]');
  if (tag) { tag.classList.toggle('active'); return; }

  // Format cards
  const fmt = e.target.closest('[data-format]');
  if (fmt) { document.querySelectorAll('[data-format]').forEach(f => f.classList.remove('active')); fmt.classList.add('active'); return; }

  // Round buttons
  const rnd = e.target.closest('[data-rounds]');
  if (rnd) { document.querySelectorAll('[data-rounds]').forEach(f => f.classList.remove('active')); rnd.classList.add('active'); return; }
});

// Search input
document.addEventListener('input', (e) => {
  if (e.target.id === 'searchInput') renderSearchResults(e.target.value);
});

// Overlay close
document.addEventListener('mousedown', (e) => {
  if (e.target.classList.contains('search-overlay')) closeSearch();
  if (e.target.classList.contains('modal-overlay')) e.target.remove();
});

// ─── Keyboard Shortcuts ────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchOpen ? closeSearch() : openSearch(); }
  if (e.key === 'Escape') { closeSearch(); const modal = document.querySelector('.modal-overlay'); if (modal) modal.remove(); }
});

// ─── Init ──────────────────────────────────────────────────────────────────
renderNav();
renderPage();
