<script lang="ts">
  import { api } from '$lib/api';
  import { onMount } from 'svelte';

  let data = $state<any>(null);
  let error = $state('');
  let loading = $state(true);

  async function load() {
    loading = true;
    error = '';
    try {
      data = await api.getAnalytics();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load analytics';
    } finally {
      loading = false;
    }
  }

  onMount(load);

  // Build a tiny inline sparkline as an SVG path from the confidence trend.
  function sparkline(trend: any[]): string {
    if (!trend || !trend.length) return '';
    const w = 240;
    const h = 48;
    const max = 1;
    const step = trend.length > 1 ? w / (trend.length - 1) : w;
    const pts = trend.map((p, i) => {
      const x = i * step;
      const y = h - (p.confidence / max) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `M ${pts.join(' L ')}`;
  }
</script>

<h1>Debate Analytics</h1>
<p class="muted">Aggregated from completed judge reports. No external analytics service.</p>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error" role="alert">{error}</p>
{:else if data}
  <section class="card">
    <h2>Overview</h2>
    <div style="display:flex; gap:1.5rem; flex-wrap:wrap;">
      <div><strong>{data.totalJudged}</strong><br /><span class="muted">Debates judged</span></div>
      <div><strong>{(data.affirmativeWinRate * 100).toFixed(0)}%</strong><br /><span class="muted">Affirmative win rate</span></div>
      <div><strong>{(data.avgConfidence * 100).toFixed(0)}%</strong><br /><span class="muted">Avg judge confidence</span></div>
    </div>
  </section>

  <section class="card">
    <h2>Outcomes</h2>
    {#if data.outcomeCounts.length}
      <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:0.4rem;">
        {#each data.outcomeCounts as o}
          <li style="display:flex; align-items:center; gap:0.5rem;">
            <span style="width:90px; text-transform:capitalize;">{o.outcome}</span>
            <span style="display:inline-block; height:14px; background:#2b5fb3; width:{Math.max(8, o.count / data.totalJudged * 200)}px;"></span>
            <span class="muted">{o.count}</span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="muted">No judged debates yet.</p>
    {/if}
  </section>

  <section class="card">
    <h2>Confidence trend</h2>
    {#if data.confidenceTrend.length}
      <svg width="240" height="48" viewBox="0 0 240 48" role="img" aria-label="Confidence trend">
        <path d={sparkline(data.confidenceTrend)} fill="none" stroke="#2b5fb3" stroke-width="2" />
      </svg>
      <p class="muted">{data.confidenceTrend.length} debates, oldest → newest</p>
    {:else}
      <p class="muted">No data yet.</p>
    {/if}
  </section>

  <section class="card">
    <h2>Common fallacies</h2>
    {#if data.topFallacies.length}
      <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:0.4rem;">
        {#each data.topFallacies as f}
          <li style="display:flex; align-items:center; gap:0.5rem;">
            <span style="width:220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{f.fallacy}</span>
            <span style="display:inline-block; height:14px; background:#b3412b; width:{Math.max(8, f.count * 12)}px;"></span>
            <span class="muted">{f.count}</span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="muted">No fallacies recorded yet.</p>
    {/if}
  </section>
{/if}
