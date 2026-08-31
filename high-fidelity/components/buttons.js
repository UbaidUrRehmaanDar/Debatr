function mergeAttrs(defaults, attrs) {
  const merged = { ...defaults, ...attrs };
  return Object.entries(merged)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
}

function baseClasses(extra) {
  return `display:inline-flex;align-items:center;justify-content:center;gap:6px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.15s ease;${extra}`;
}

const VARIANTS = {
  primary: 'background:#2563eb;color:#fff;padding:10px 20px;',
  secondary: 'background:#f1f5f9;color:#0f172a;padding:10px 20px;border:1px solid #e2e8f0;',
  ghost: 'background:transparent;color:#475569;padding:10px 20px;',
  danger: 'background:#dc2626;color:#fff;padding:10px 20px;',
};

function button(variant, text, attrs = {}) {
  const { loading, disabled, ...rest } = attrs;
  const attrsStr = mergeAttrs(
    { style: baseClasses(VARIANTS[variant]), type: 'button' },
    { disabled: disabled || loading, ...rest }
  );
  const spinner = loading
    ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="animation:spin 0.6s linear infinite;"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" stroke-dasharray="28" stroke-dashoffset="8"/></svg>'
    : '';
  return `<button ${attrsStr}>${spinner}${text}</button>`;
}

export function primaryButton(text, attrs) {
  return button('primary', text, attrs);
}

export function secondaryButton(text, attrs) {
  return button('secondary', text, attrs);
}

export function ghostButton(text, attrs) {
  return button('ghost', text, attrs);
}

export function dangerButton(text, attrs) {
  return button('danger', text, attrs);
}

export function iconButton(svg, attrs = {}) {
  const { loading, disabled, ...rest } = attrs;
  const attrsStr = mergeAttrs(
    { style: baseClasses('padding:8px;border-radius:8px;background:transparent;color:#475569;'), type: 'button' },
    { disabled: disabled || loading, ...rest }
  );
  return `<button ${attrsStr}>${svg}</button>`;
}

export function linkButton(text, href, attrs = {}) {
  const attrsStr = mergeAttrs(
    { style: baseClasses(VARIANTS.primary), href },
    attrs
  );
  return `<a ${attrsStr}>${text}</a>`;
}
