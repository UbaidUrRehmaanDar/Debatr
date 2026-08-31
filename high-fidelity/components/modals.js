export function modal(id, title, content, attrs = {}) {
  const { confirmText, cancelText, onConfirm, ...rest } = attrs;
  const restStr = Object.entries(rest)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  return `
    <div id="${id}" ${restStr} style="display:none;position:fixed;inset:0;z-index:1000;align-items:center;justify-content:center;">
      <div onclick="closeModal('${id}')" style="position:absolute;inset:0;background:rgba(0,0,0,0.5);"></div>
      <div style="position:relative;background:#fff;border-radius:16px;padding:24px;max-width:480px;width:90%;max-height:80vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <h2 style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">${title}</h2>
          <button onclick="closeModal('${id}')" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:20px;line-height:1;">&times;</button>
        </div>
        <div>${content}</div>
      </div>
    </div>`;
}

export function confirmModal(id, title, message, confirmText = 'Confirm', attrs = {}) {
  const onConfirm = attrs.onConfirm || '';
  const rest = { ...attrs };
  delete rest.onConfirm;
  const restStr = Object.entries(rest)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  return `
    <div id="${id}" ${restStr} style="display:none;position:fixed;inset:0;z-index:1000;align-items:center;justify-content:center;">
      <div onclick="closeModal('${id}')" style="position:absolute;inset:0;background:rgba(0,0,0,0.5);"></div>
      <div style="position:relative;background:#fff;border-radius:16px;padding:24px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
        <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#0f172a;">${title}</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">${message}</p>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button onclick="closeModal('${id}')" style="padding:10px 20px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;font-size:14px;font-weight:600;cursor:pointer;color:#475569;">Cancel</button>
          <button onclick="${onConfirm}" style="padding:10px 20px;border-radius:8px;border:none;background:#dc2626;color:#fff;font-size:14px;font-weight:600;cursor:pointer;">${confirmText}</button>
        </div>
      </div>
    </div>`;
}

export function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = 'flex';
    el.style.animation = 'fadeIn 0.2s ease';
  }
}

export function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.animation = 'fadeOut 0.15s ease';
    setTimeout(() => { el.style.display = 'none'; }, 150);
  }
}
