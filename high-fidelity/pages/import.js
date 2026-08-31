function renderImport() {
  return `
    <div class="page-content-narrow">
      <div class="page-header"><h1>Import Debate</h1><p>Upload an existing debate to continue working with it inside Debatr.</p></div>
      <div class="dropzone" id="dropzone">
        <div class="dropzone-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <div class="dropzone-text">
          <span class="dropzone-title">Drop your file here</span>
          <span class="dropzone-subtitle">or click to browse \u00b7 JSON, PDF, .debatr \u00b7 Max 25 MB</span>
        </div>
      </div>
      <input type="file" id="fileInput" accept=".json,.pdf,.debatr" style="display:none;" />
      <div class="form-divider" style="margin:var(--space-xxl) 0;"></div>
      <div class="form-actions">
        <button class="btn btn-primary btn-lg" disabled>Import Debate</button>
        <button class="btn btn-secondary btn-lg" onclick="navigate('debates')">Cancel</button>
      </div>
    </div>
  `;
}
