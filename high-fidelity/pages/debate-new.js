function renderDebateNew() {
  const categories = ['Education','Economics','Policy','Technology','Law','Ethics'];
  const formats = [
    { k: 'oxford', l: 'Oxford Classic', s: 'Classic proposition vs. opposition' },
    { k: 'lincoln', l: 'Lincoln-Douglas', s: 'Value-based, two-person' },
    { k: 'open', l: 'Open Format', s: 'Flexible structure' },
  ];

  return `
    <div class="page-content-narrow">
      <div class="page-header"><h1>New Debate</h1><p>Define your topic and configure the debate session.</p></div>
      <div class="new-debate-form">
        <div class="form-group">
          <label class="form-label">Debate Topic</label>
          <input class="form-input" id="topicInput" type="text" placeholder="e.g. Artificial intelligence should be regulated" />
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <div class="topic-tags">
            ${categories.map(t => `<button class="topic-tag" data-topic="${t}">${t}</button>`).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Format</label>
          <div class="format-grid">
            ${formats.map(f => `<button class="format-card" data-format="${f.k}"><div class="format-card-title">${f.l}</div><div class="format-card-sub">${f.s}</div></button>`).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Rounds</label>
          <div class="rounds-row">
            ${['4','6','8','10'].map(r => `<button class="round-btn" data-rounds="${r}">${r}</button>`).join('')}
          </div>
        </div>
        <div class="form-divider"></div>
        <div class="form-actions">
          <button class="btn btn-primary btn-lg">Start Debate</button>
          <button class="btn btn-secondary btn-lg" onclick="navigate('debates')">Cancel</button>
        </div>
      </div>
    </div>
  `;
}
