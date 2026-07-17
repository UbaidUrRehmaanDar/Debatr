<script lang="ts">
  import { api } from '$lib/api';
  import { onMount } from 'svelte';

  let debates = $state<any[]>([]);
  let error = $state('');
  let loading = $state(true);

  async function load() {
    loading = true;
    try {
      debates = await api.listDebates();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load debates';
    } finally {
      loading = false;
    }
  }

  onMount(load);

  const STATUS_LABEL: Record<string, string> = {
    draft: 'Draft',
    waiting_for_participants: 'Awaiting opponent',
    active: 'In progress',
    paused: 'Paused',
    judging: 'Judging',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
</script>

<h1>Your debates</h1>

{#if error}<p class="error" role="alert">{error}</p>{/if}
{#if loading}<p class="muted">Loading…</p>{/if}

<a href="/debates/new" class="btn-secondary" style="display:inline-block;margin-bottom:1rem;">+ New debate</a>

{#if !loading && debates.length === 0}
  <div class="card"><p class="muted">No debates yet. Start one to invite an opponent.</p></div>
{/if}

{#each debates as d (d.id)}
  <a href={`/debates/${d.id}`} class="card" style="display:block; text-decoration:none; color:inherit;">
    <div style="display:flex; justify-content:space-between; align-items:baseline;">
      <h3 style="margin:0;">{d.topic}</h3>
      <span class="tag neutral">{STATUS_LABEL[d.status] || d.status}</span>
    </div>
    <p class="muted" style="margin:0.25rem 0 0;">
      Round {d.currentRound + 1} of {d.maxRounds} · Affirmative: {d.participants?.affirmative?.displayName || '—'} vs Negative: {d.participants?.negative?.displayName || '—'}
    </p>
  </a>
{/each}
