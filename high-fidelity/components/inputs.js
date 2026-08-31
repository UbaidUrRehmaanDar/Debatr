const BASE_STYLE =
  'width:100%;padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:14px;color:#0f172a;background:#fff;outline:none;transition:border-color 0.15s;box-sizing:border-box;';
const FOCUS_STYLE = 'this.style.borderColor="#2563eb"';
const LABEL_STYLE = 'display:block;font-size:13px;font-weight:600;color:#334155;margin-bottom:6px;';

function mergeAttrs(defaults, attrs) {
  const merged = { ...defaults, ...attrs };
  return Object.entries(merged)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
}

export function textInput(id, label, attrs = {}) {
  const inputAttrs = mergeAttrs(
    { id, type: 'text', style: BASE_STYLE, onfocus: FOCUS_STYLE, onblur: 'this.style.borderColor="#e2e8f0"' },
    attrs
  );
  return `<div style="margin-bottom:16px;"><label for="${id}" style="${LABEL_STYLE}">${label}</label><input ${inputAttrs}></div>`;
}

export function emailInput(id, label, attrs = {}) {
  const inputAttrs = mergeAttrs(
    { id, type: 'email', style: BASE_STYLE, onfocus: FOCUS_STYLE, onblur: 'this.style.borderColor="#e2e8f0"' },
    attrs
  );
  return `<div style="margin-bottom:16px;"><label for="${id}" style="${LABEL_STYLE}">${label}</label><input ${inputAttrs}></div>`;
}

export function passwordInput(id, label, attrs = {}) {
  const showId = `${id}-toggle`;
  const toggleScript = `var p=document.getElementById('${id}');p.type=p.type==='password'?'text':'password';`;
  const inputAttrs = mergeAttrs(
    { id, type: 'password', style: BASE_STYLE + 'padding-right:40px;', onfocus: FOCUS_STYLE, onblur: 'this.style.borderColor="#e2e8f0"' },
    attrs
  );
  return `
    <div style="margin-bottom:16px;position:relative;">
      <label for="${id}" style="${LABEL_STYLE}">${label}</label>
      <input ${inputAttrs}>
      <button id="${showId}" type="button" onclick="${toggleScript}" style="position:absolute;right:8px;top:34px;background:none;border:none;cursor:pointer;color:#64748b;font-size:13px;">Show</button>
    </div>`;
}

export function textareaInput(id, label, attrs = {}) {
  const inputAttrs = mergeAttrs(
    { id, rows: '4', style: BASE_STYLE + 'resize:vertical;', onfocus: FOCUS_STYLE, onblur: 'this.style.borderColor="#e2e8f0"' },
    attrs
  );
  return `<div style="margin-bottom:16px;"><label for="${id}" style="${LABEL_STYLE}">${label}</label><textarea ${inputAttrs}></textarea></div>`;
}

export function selectInput(id, label, options = [], attrs = {}) {
  const optionHtml = options
    .map((o) => {
      const val = typeof o === 'string' ? o : o.value;
      const txt = typeof o === 'string' ? o : o.label;
      return `<option value="${val}">${txt}</option>`;
    })
    .join('');
  const inputAttrs = mergeAttrs({ id, style: BASE_STYLE }, attrs);
  return `<div style="margin-bottom:16px;"><label for="${id}" style="${LABEL_STYLE}">${label}</label><select ${inputAttrs}>${optionHtml}</select></div>`;
}

export function searchInput(id, placeholder = 'Search...', attrs = {}) {
  const icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
  const inputAttrs = mergeAttrs(
    { id, type: 'search', placeholder, style: BASE_STYLE + 'padding-left:36px;', onfocus: FOCUS_STYLE, onblur: 'this.style.borderColor="#e2e8f0"' },
    attrs
  );
  return `<div style="position:relative;margin-bottom:16px;"><span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none;">${icon}</span><input ${inputAttrs}></div>`;
}
