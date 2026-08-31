function mergeAttrs(defaults, attrs) {
  const merged = { ...defaults, ...attrs };
  return Object.entries(merged)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
}

export function card(content, attrs = {}) {
  const base = 'background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;';
  const attrsStr = mergeAttrs({ style: base }, attrs);
  return `<div ${attrsStr}>${content}</div>`;
}

export function hoverableCard(content, attrs = {}) {
  const base =
    'background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;transition:box-shadow 0.2s ease,transform 0.2s ease;cursor:pointer;';
  const events = `onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='none';this.style.transform='none'"`;
  const attrsStr = mergeAttrs({ style: base }, attrs);
  return `<div ${attrsStr} ${events}>${content}</div>`;
}

export function statCard(icon, label, value, color = '#2563eb') {
  return `
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;display:flex;align-items:center;gap:16px;">
      <div style="width:48px;height:48px;border-radius:12px;background:${color}15;display:flex;align-items:center;justify-content:center;color:${color};">${icon}</div>
      <div>
        <div style="font-size:13px;color:#64748b;margin-bottom:2px;">${label}</div>
        <div style="font-size:24px;font-weight:700;color:#0f172a;">${value}</div>
      </div>
    </div>`;
}

export function infoCard(icon, title, items = []) {
  const list = items
    .map(
      (item) =>
        `<li style="padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">${item}</li>`
    )
    .join('');
  return `
    <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <span style="color:#2563eb;">${icon}</span>
        <h3 style="margin:0;font-size:16px;font-weight:600;color:#0f172a;">${title}</h3>
      </div>
      <ul style="list-style:none;margin:0;padding:0;">${list}</ul>
    </div>`;
}
