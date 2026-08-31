const STATUS_STYLES = {
  active: { bg: '#dcfce7', color: '#166534', label: 'Active' },
  completed: { bg: '#dbeafe', color: '#1e40af', label: 'Completed' },
  waiting: { bg: '#fef9c3', color: '#854d0e', label: 'Waiting' },
  paused: { bg: '#ffedd5', color: '#9a3412', label: 'Paused' },
  judging: { bg: '#f3e8ff', color: '#6b21a8', label: 'Judging' },
  cancelled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
  draft: { bg: '#f3f4f6', color: '#374151', label: 'Draft' },
};

const ROLE_STYLES = {
  admin: { bg: '#fef3c7', color: '#92400e', label: 'Admin' },
  user: { bg: '#e0e7ff', color: '#3730a3', label: 'User' },
};

const VERDICT_STYLES = {
  verified: { bg: '#dcfce7', color: '#166534', label: 'Verified' },
  disputed: { bg: '#fee2e2', color: '#991b1b', label: 'Disputed' },
  unverified: { bg: '#f3f4f6', color: '#374151', label: 'Unverified' },
  mixed: { bg: '#fef9c3', color: '#854d0e', label: 'Mixed' },
};

const SIDE_STYLES = {
  affirmative: { bg: '#dcfce7', color: '#166534', label: 'Affirmative' },
  negative: { bg: '#fee2e2', color: '#991b1b', label: 'Negative' },
  neutral: { bg: '#f3f4f6', color: '#374151', label: 'Neutral' },
};

function badge(style) {
  return `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:9999px;font-size:12px;font-weight:600;line-height:1.5;background:${style.bg};color:${style.color};">${style.label}</span>`;
}

export function statusBadge(status) {
  return badge(STATUS_STYLES[status] || STATUS_STYLES.draft);
}

export function roleBadge(role) {
  return badge(ROLE_STYLES[role] || ROLE_STYLES.user);
}

export function verdictBadge(verdict) {
  return badge(VERDICT_STYLES[verdict] || VERDICT_STYLES.unverified);
}

export function sideBadge(side) {
  return badge(SIDE_STYLES[side] || SIDE_STYLES.neutral);
}
