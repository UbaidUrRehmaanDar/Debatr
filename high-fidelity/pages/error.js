function renderError() {
  return `
    <div class="page-content" style="display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 48px);">
      <div class="empty-state">
        <div style="font-size:120px;font-weight:800;background:linear-gradient(135deg,var(--notion-accent-sky),var(--notion-accent-purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;margin-bottom:16px;">404</div>
        <div class="empty-state-title" style="font-size:24px;margin-bottom:10px;">Page not found</div>
        <div class="empty-state-desc" style="font-size:16px;max-width:400px;margin-bottom:32px;">The page you're looking for doesn't exist or has been moved.</div>
        <div style="display:flex;gap:12px;justify-content:center;">
          <button class="btn btn-secondary btn-lg" onclick="history.back()">Go back</button>
          <button class="btn btn-primary btn-lg" onclick="navigate('debates')">Go to debates</button>
        </div>
      </div>
    </div>
  `;
}
