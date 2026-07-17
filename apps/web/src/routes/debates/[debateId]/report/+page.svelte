<script lang="ts">
  import { api } from '$lib/api';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  const debateId = $derived($page.params.debateId!);

  async function downloadExport() {
    try {
      const data = await api.exportDebate(debateId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debatr-${debateId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Export failed';
    }
  }

  let debate = $state<any>(null);
  let report = $state<any>(null);
  let moderationEvents = $state<any[]>([]);
  let error = $state('');
  let loading = $state(true);
  let judging = $state(false);

  async function load() {
    loading = true;
    error = '';
    try {
      debate = await api.getDebate(debateId);
      moderationEvents = debate.moderationEvents ?? [];
      try {
        report = await api.getReport(debateId);
      } catch {
        report = null;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load';
    } finally {
      loading = false;
    }
  }

  async function runJudge() {
    judging = true;
    error = '';
    try {
      report = await api.judgeDebate(debateId);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Judging failed';
    } finally {
      judging = false;
    }
  }

  onMount(load);

  const OUTCOME_LABEL: Record<string, string> = {
    affirmative: 'Affirmative wins',
    negative: 'Negative wins',
    draw: 'Draw',
    inconclusive: 'Inconclusive',
  };

  function scoreRow(label: string, a: number, n: number) {
    return { label, a, n };
  }
</script>

{#if loading}
  <p class="muted">Loading report…</p>
{:else if error && !debate}
  <p class="error" role="alert">{error}</p>
{:else}
  <h1>Judge assessment</h1>
  <p class="muted">{debate.topic}</p>

  {#if !report}
    <div class="card">
      <p>No Judge report yet. The transcript is locked for evaluation.</p>
      {#if debate.status === 'judging'}
        <button type="button" onclick={runJudge} disabled={judging}>{judging ? 'Evaluating…' : 'Run Judge'}</button>
      {:else if debate.status === 'active'}
        <p class="muted">Finish the debate (move it to judging) before requesting a report.</p>
        <a href={`/debates/${debateId}`} class="btn-secondary">Back to debate</a>
      {:else}
        <p class="muted">This debate has not reached judging.</p>
      {/if}
    </div>
  {:else}
    <div class="card">
      <h2>Outcome</h2>
      <p style="font-size:1.25rem;"><strong>{OUTCOME_LABEL[report.outcome] ?? report.outcome}</strong></p>
      <p class="muted">Judge confidence: {(report.confidence * 100).toFixed(0)}%</p>
      <p>{report.verdict}</p>
    </div>

    <div class="card">
      <h2>Rubric breakdown</h2>
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr><th style="text-align:left;">Criterion</th><th>Affirmative</th><th>Negative</th></tr>
        </thead>
        <tbody>
          {#each [scoreRow('Logical consistency', report.scores.affirmative.logicalConsistency, report.scores.negative.logicalConsistency),
                  scoreRow('Evidence quality', report.scores.affirmative.evidenceQuality, report.scores.negative.evidenceQuality),
                  scoreRow('Rebuttal effectiveness', report.scores.affirmative.rebuttalEffectiveness, report.scores.negative.rebuttalEffectiveness),
                  scoreRow('Argument structure', report.scores.affirmative.argumentStructure, report.scores.negative.argumentStructure),
                  scoreRow('Responsiveness', report.scores.affirmative.responsiveness, report.scores.negative.responsiveness)]
                  as row}
            <tr>
              <td style="border-top:1px solid var(--border); padding:0.4rem 0;">{row.label}</td>
              <td style="border-top:1px solid var(--border); text-align:center;">{row.a}</td>
              <td style="border-top:1px solid var(--border); text-align:center;">{row.n}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2>Feedback</h2>
      <h3>Affirmative strengths</h3>
      <ul>{#each report.strengths.affirmative as s}<li>{s}</li>{/each}</ul>
      <h3>Affirmative weaknesses</h3>
      <ul>{#each report.weaknesses.affirmative as s}<li>{s}</li>{/each}</ul>
      <p>{report.feedback.affirmative}</p>
      <h3>Negative strengths</h3>
      <ul>{#each report.strengths.negative as s}<li>{s}</li>{/each}</ul>
      <h3>Negative weaknesses</h3>
      <ul>{#each report.weaknesses.negative as s}<li>{s}</li>{/each}</ul>
      <p>{report.feedback.negative}</p>
    </div>

    {#if report.fallacies?.length}
      <div class="card">
        <h2>Logical fallacies</h2>
        <ul>
          {#each report.fallacies as f}
            <li><span class="tag {f.side}">{f.side}</span> <strong>{f.label}</strong> — {f.explanation}</li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if report.conductFindings?.length}
      <div class="card">
        <h2>Conduct findings</h2>
        <ul>
          {#each report.conductFindings as c}
            <li><span class="tag {c.side}">{c.side}</span> <strong>{c.recommendedAction}</strong> — {c.explanation}</li>
          {/each}
        </ul>
      </div>
    {/if}

    <div class="card">
      <h2>Summary</h2>
      <p>{report.summary}</p>
    </div>

    {#if moderationEvents.length}
      <div class="card">
        <h2>Moderation record</h2>
        <ul>
          {#each moderationEvents as m}
            <li>
              <span class="tag neutral">{m.action}</span>
              <span class="tag neutral">{m.category}</span>
              {m.explanation}{m.createdAt ? ` — ${new Date(m.createdAt).toLocaleString()}` : ''}
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  {/if}

  <p>
    <button type="button" onclick={downloadExport}>Download export (JSON)</button>
    <a href={`/debates/${debateId}`} style="margin-left:0.5rem;">Back to debate</a>
  </p>
{/if}
