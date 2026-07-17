<script lang="ts">
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';

  let topic = $state('');
  let description = $state('');
  let opponentEmail = $state('');
  let error = $state('');
  let loading = $state(false);

  async function submit(e: Event) {
    e.preventDefault();
    error = '';
    loading = true;
    try {
      const debate = await api.createDebate(topic, description || undefined, opponentEmail);
      goto(`/debates/${debate.id}`, { replaceState: true });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create debate';
    } finally {
      loading = false;
    }
  }
</script>

<div class="card" style="max-width: 520px;">
  <h1>New debate</h1>
  <p class="muted">Invite an opponent by their registered email. They accept with “Join” to start the debate.</p>
  <form onsubmit={submit}>
    <label for="topic">Motion / topic</label>
    <input id="topic" bind:value={topic} required placeholder="e.g. This house would prioritise renewable energy" />

    <label for="description">Description (optional)</label>
    <textarea id="description" bind:value={description} rows="3"></textarea>

    <label for="opponent">Opponent email</label>
    <input id="opponent" type="email" bind:value={opponentEmail} required placeholder="opponent@example.com" />

    {#if error}<p class="error" role="alert">{error}</p>{/if}

    <div style="margin-top: 1rem; display:flex; gap:0.5rem;">
      <button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create debate'}</button>
      <a href="/debates" class="btn-secondary" style="align-self:center;">Cancel</a>
    </div>
  </form>
</div>
