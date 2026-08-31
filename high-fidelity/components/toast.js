const TOAST_STYLES = {
  success: { bg: '#dcfce7', color: '#166534', border: '#86efac', icon: '✓' },
  error: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', icon: '✕' },
  info: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd', icon: 'i' },
  warning: { bg: '#fef9c3', color: '#854d0e', border: '#fde047', icon: '!' },
};

let toastCounter = 0;

export function toastContainer() {
  return `<div id="toast-container" style="position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;"></div>
  <style>
    @keyframes toastIn { from { opacity:0;transform:translateX(40px); } to { opacity:1;transform:translateX(0); } }
    @keyframes toastOut { from { opacity:1;transform:translateX(0); } to { opacity:0;transform:translateX(40px); } }
  </style>`;
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const style = TOAST_STYLES[type] || TOAST_STYLES.info;
  const id = `toast-${++toastCounter}`;

  const toast = document.createElement('div');
  toast.id = id;
  toast.style.cssText = `
    pointer-events:auto;display:flex;align-items:center;gap:10px;
    padding:12px 16px;border-radius:10px;min-width:280px;max-width:420px;
    background:${style.bg};color:${style.color};border:1px solid ${style.border};
    box-shadow:0 4px 12px rgba(0,0,0,0.1);font-size:14px;font-weight:500;
    animation:toastIn 0.25s ease;
  `;
  toast.innerHTML = `
    <span style="width:22px;height:22px;border-radius:50%;background:${style.color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">${style.icon}</span>
    <span style="flex:1;">${message}</span>
    <button onclick="this.parentElement.style.animation='toastOut 0.2s ease';setTimeout(()=>this.parentElement.remove(),200)"
      style="background:none;border:none;cursor:pointer;color:inherit;font-size:16px;line-height:1;padding:0;opacity:0.7;">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'toastOut 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }
  }, 3000);
}
