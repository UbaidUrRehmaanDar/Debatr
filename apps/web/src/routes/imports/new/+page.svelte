<script lang="ts">
  import { api } from '$lib/api';

  let file = $state<File | null>(null);
  let preview = $state<any>(null);
  let error = $state('');
  let message = $state('');
  let importing = $state(false);

  const MAX_IMPORT_BYTES = 5 * 1024 * 1024; // 5 MB, matches the API limit

  async function onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    file = f;
    preview = null;
    error = '';
    message = '';
    if (!f) return;
    if (f.size > MAX_IMPORT_BYTES) {
      error = 'File is too large (max 5 MB).';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        preview = JSON.parse(String(reader.result));
      } catch {
        error = 'Invalid JSON file.';
      }
    };
    reader.readAsText(f);
  }

  async function submit() {
    if (!preview) return;
    importing = true;
    error = '';
    message = '';
    try {
      const res = await api.importDebate(preview);
      message = res.note || 'Imported as reference material.';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Import failed';
    } finally {
      importing = false;
    }
  }
</script>

<h1>Import debate reference</h1>
<p class="muted">
  Importing an exported debate is user-directed reference material for a later debate. It is not automatic memory.
</p>

<label for="file">Exported debate JSON</label>
<input id="file" type="file" accept="application/json" onchange={onFile} />

{#if error}<p class="error" role="alert">{error}</p>{/if}
{#if message}<p class="muted" role="status">{message}</p>{/if}

{#if preview}
  <div class="card">
    <h2>Preview</h2>
    <p><strong>Topic:</strong> {preview.debate?.topic ?? '(unknown)'}</p>
    <p><strong>Outcome:</strong> {preview.judgeReport?.outcome ?? '(none)'}</p>
    <p class="muted">Server will validate the schema and version before storing it as a reference.</p>
    <button onclick={submit} disabled={importing}>Import as reference</button>
  </div>
{/if}
