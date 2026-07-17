<script lang="ts">
  import { api } from '$lib/api';
  import { DebateSocket, type DebateEvent, type WsStatus } from '$lib/ws';
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  const debateId = $derived($page.params.debateId!);

  let debate = $state<any>(null);
  let messages = $state<any[]>([]);
  let mySide = $state<string | null>(null);
  let error = $state('');
  let loading = $state(true);
  let socket = new DebateSocket();
  let connection = $state<WsStatus>('connecting');
  let presentCount = $state(1);

  let draft = $state('');           // message composer
  let sending = $state(false);
  let raiseHandBusy = $state(false);
  let completing = $state(false);

  // Lawyer panel
  let lawyerOpen = $state(false);
  let lawyerRequest = $state('');
  let lawyerBusy = $state(false);
  let lawyerAdvice = $state<any>(null);
  let lawyerError = $state('');

  // Evidence
  let evidenceClaim = $state('');
  let evidenceSource = $state('');
  let evidenceSide = $state<'affirmative' | 'negative' | 'neutral'>('neutral');
  let evidenceList = $state<any[]>([]);
  let evidenceBusy = $state(false);

  // Fact-check results keyed by messageId, plus per-message busy state.
  let factChecks = $state<Record<string, any>>({});
  let factChecking = $state<Record<string, boolean>>({});

  // Real-time presence extras: typing indicators, transient reactions, AI state.
  let typingUsers = $state<Record<string, string>>({}); // userId -> side
  let reactions = $state<Array<{ id: number; emoji: string; side: string }>>([]);
  let aiThinking = $state<{ lawyer: boolean; judge: boolean }>({ lawyer: false, judge: false });
  let reactionSeq = 0;

  let typingTimer: ReturnType<typeof setTimeout> | null = null;
  function notifyTyping() {
    socket.send({ type: 'typing', isTyping: true });
    if (typingTimer) clearTimeout(typingTimer);
    typingTimer = setTimeout(() => socket.send({ type: 'typing', isTyping: false }), 1500);
  }

  function sendReaction(emoji: string) {
    socket.send({ type: 'react', emoji });
    // Optimistically show our own reaction too (server doesn't echo to sender).
    addReaction(emoji, mySide ?? 'neutral');
  }

  function addReaction(emoji: string, side: string) {
    const id = ++reactionSeq;
    reactions = [...reactions, { id, emoji, side }];
    setTimeout(() => { reactions = reactions.filter((r) => r.id !== id); }, 3000);
  }

  // Current user (for side detection) + teardown guard for navigation.
  let me = $state<any>(null);
  let destroyed = $state(false);

  // Navigate only if the component is still mounted, to avoid goto-after-unmount errors.
  function navigate(to: string) {
    if (!destroyed) goto(to, { replaceState: true });
  }

  async function loadSnapshot() {
    try {
      const d = await api.getDebate(debateId);
      debate = d;
      mySide = d.participants?.affirmative?.userId === me?.id
        ? 'affirmative'
        : d.participants?.negative?.userId === me?.id
          ? 'negative'
          : null;
      messages = d.messages ?? [];
      evidenceList = d.evidence ?? [];
      if (d.status === 'judging' || d.status === 'completed') {
        navigate(`/debates/${debateId}/report`);
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load debate';
    } finally {
      loading = false;
    }
  }

  async function loadMe() {
    try {
      const { user } = await api.me();
      me = user;
    } catch {
      me = null;
    }
  }

  function onEvent(e: DebateEvent) {
    if (destroyed) return;
    if (e.type === 'error') error = e.message;
    if (e.type === 'debate_state_changed') {
      if (e.status === 'judging' || e.status === 'completed') {
        navigate(`/debates/${debateId}/report`);
      } else {
        debate = { ...debate, status: e.status, currentTurnId: e.currentTurnId, currentRound: e.currentRound };
      }
    }
    if (e.type === 'turn_advanced') {
      debate = { ...debate, currentTurnId: e.nextTurnId };
    }
    if (e.type === 'message_posted') {
      loadSnapshot();
    }
    if (e.type === 'presence') {
      presentCount = Math.max(1, e.userIds.length);
    }
    if (e.type === 'fact_checked') {
      loadSnapshot();
    }
    if (e.type === 'typing') {
      if (e.isTyping) typingUsers = { ...typingUsers, [e.userId]: e.side };
      else {
        const next = { ...typingUsers };
        delete next[e.userId];
        typingUsers = next;
      }
    }
    if (e.type === 'reaction') {
      addReaction(e.emoji, e.side);
    }
    if (e.type === 'ai_thinking') {
      aiThinking = { ...aiThinking, [e.role]: e.isThinking };
    }
  }

  async function sendMessage() {
    if (!draft.trim()) return;
    sending = true;
    error = '';
    try {
      await api.postMessage(debateId, draft.trim());
      draft = '';
      await loadSnapshot();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to send';
    } finally {
      sending = false;
    }
  }

  async function doRaiseHand() {
    raiseHandBusy = true;
    try {
      await api.raiseHand(debateId);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Raise hand failed';
    } finally {
      raiseHandBusy = false;
    }
  }

  async function doComplete() {
    completing = true;
    try {
      await api.completeDebate(debateId);
      navigate(`/debates/${debateId}/report`);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to complete';
    } finally {
      completing = false;
    }
  }

  let pausing = $state(false);
  let resuming = $state(false);
  let joining = $state(false);

  async function doJoin() {
    joining = true;
    error = '';
    try {
      await api.joinDebate(debateId);
      await loadSnapshot();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to join';
    } finally {
      joining = false;
    }
  }

  let cancelling = $state(false);
  let cancelReason = $state('');

  async function doPause() {
    pausing = true;
    try {
      await api.pauseDebate(debateId);
      debate = { ...debate, status: 'paused' };
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to pause';
    } finally {
      pausing = false;
    }
  }

  async function doResume() {
    resuming = true;
    try {
      await api.resumeDebate(debateId);
      debate = { ...debate, status: 'active' };
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to resume';
    } finally {
      resuming = false;
    }
  }

  async function doCancel() {
    cancelling = true;
    try {
      await api.cancelDebate(debateId, cancelReason.trim() || undefined);
      debate = { ...debate, status: 'cancelled' };
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to cancel';
    } finally {
      cancelling = false;
    }
  }

  async function askLawyer() {
    lawyerBusy = true;
    lawyerError = '';
    try {
      const res = await api.requestLawyer(debateId, lawyerRequest.trim());
      lawyerAdvice = res.advice;
      lawyerRequest = '';
    } catch (err) {
      lawyerError = err instanceof Error ? err.message : 'Lawyer request failed';
    } finally {
      lawyerBusy = false;
    }
  }

  async function pinEvidence() {
    if (!evidenceClaim.trim()) return;
    evidenceBusy = true;
    try {
      const row = await api.pinEvidence(debateId, evidenceClaim.trim(), evidenceSource.trim() || undefined, evidenceSide);
      evidenceList = [...evidenceList, row];
      evidenceClaim = '';
      evidenceSource = '';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to pin evidence';
    } finally {
      evidenceBusy = false;
    }
  }

  // Derived UI state
  let isMyTurn = $derived(
    debate?.status === 'active' && mySide !== null && debate.currentTurnSide === mySide
  );
  let canPost = $derived(isMyTurn && !sending);

  async function runFactCheck(messageId: string) {
    factChecking = { ...factChecking, [messageId]: true };
    error = '';
    try {
      const res = await api.factCheckMessage(debateId, messageId);
      factChecks = { ...factChecks, [messageId]: { verdict: res.verdict, claims: res.claims } };
    } catch (err) {
      error = err instanceof Error ? err.message : 'Fact-check failed';
    } finally {
      factChecking = { ...factChecking, [messageId]: false };
    }
  }

  onMount(async () => {
    await loadMe();
    await loadSnapshot();
    socket.connect(debateId, onEvent, (s) => { connection = s; });
  });
  onDestroy(() => {
    destroyed = true;
    socket.disconnect();
  });
</script>

{#if loading}
  <p class="muted">Loading debate…</p>
{:else if error && !debate}
  <p class="error" role="alert">{error}</p>
{:else if debate}
  <header style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap;">
    <div>
      <h1 style="margin:0;">{debate.topic}</h1>
      <p class="muted" style="margin:0.25rem 0 0;">
        Round {(debate.currentRound ?? 0) + 1} of {debate.maxRounds} ·
        Affirmative: {debate.participants?.affirmative?.displayName} ·
        Negative: {debate.participants?.negative?.displayName}
      </p>
    </div>
    <div style="text-align:right;">
      <span class="tag neutral">{debate.status.replace(/_/g, ' ')}</span>
      <p class="muted" style="margin:0.25rem 0 0;">Connection: {connection} · {presentCount} online</p>
      {#if Object.keys(typingUsers).length}
        <p class="muted" style="margin:0.1rem 0 0;">{Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length > 1 ? 'are' : 'is'} typing…</p>
      {/if}
      {#if aiThinking.lawyer || aiThinking.judge}
        <p class="muted" style="margin:0.1rem 0 0;">🤖 AI {aiThinking.judge ? 'Judge' : 'Lawyer'} is thinking…</p>
      {/if}
    </div>
  </header>

  {#if error}<p class="error" role="alert">{error}</p>{/if}

  <!-- Turn indicator -->
  <div class="card" aria-live="polite">
    {#if debate.status === 'waiting_for_participants'}
      <p>This debate is waiting for the opponent to join. Share the link so they can accept.</p>
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <button type="button" class="btn-secondary" onclick={() => navigator.clipboard?.writeText(location.href)}>Copy invite link</button>
        {#if mySide === 'negative'}
          <button type="button" onclick={doJoin} disabled={joining}>{joining ? 'Joining…' : 'Join as opponent'}</button>
        {/if}
      </div>
    {:else if debate.status === 'active'}
      <p>
        <strong>Current turn:</strong>
        <span class="tag {debate.currentTurnSide}">{debate.currentTurnSide}</span>
        {#if mySide && debate.currentTurnSide !== mySide}
          <span class="muted">— it is not your turn. You may raise a hand.</span>
        {:else if isMyTurn}
          <span class="muted">— it is your turn to speak.</span>
        {/if}
      </p>
      <p class="muted">Limit: {debate.maxCharactersPerTurn} characters per turn.</p>
    {:else if debate.status === 'judging' || debate.status === 'completed'}
      <p>Debate concluded. View the <a href={`/debates/${debateId}/report`}>Judge report</a>.</p>
    {/if}
  </div>

  <!-- Transcript -->
  <section class="card">
    <h2>Transcript</h2>
    {#if reactions.length}
      <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.5rem;" aria-hidden="true">
        {#each reactions as r (r.id)}
          <span style="font-size:1.4rem; animation: pop 0.3s ease;">{r.emoji}</span>
        {/each}
      </div>
    {/if}
    {#if messages.length === 0}
      <p class="muted">No messages yet.</p>
    {:else}
         <ul style="list-style:none; padding:0; display:flex; flex-direction:column; gap:0.5rem;" aria-live="polite" aria-label="Debate transcript" aria-relevant="additions">
          {#each messages as m (m.id)}
           <li class="card" style="margin:0;">
             <span class="tag {m.side === 'system' ? 'neutral' : m.side}">{m.side}</span>
             <span class="muted" style="font-size:0.8rem;">{new Date(m.createdAt).toLocaleTimeString()}</span>
             <p style="margin:0.4rem 0 0; white-space:pre-wrap;">{m.content}</p>
             {#if m.side !== 'system'}
               <div style="margin-top:0.4rem; display:flex; gap:0.5rem; align-items:flex-start; flex-wrap:wrap;">
                 <button class="btn-secondary" type="button" onclick={() => runFactCheck(m.id)} disabled={factChecking[m.id]}>
                   {factChecking[m.id] ? 'Checking…' : 'Fact-check'}
                 </button>
                 {#if m.factCheck || factChecks[m.id]}
                   {@const fc = factChecks[m.id] ?? m.factCheck}
                   <span class="tag {fc.verdict === 'verified' ? 'affirmative' : fc.verdict === 'disputed' ? 'negative' : 'neutral'}">
                     {fc.verdict}
                   </span>
                   <ul style="flex-basis:100%; margin:0.25rem 0 0; padding-left:1.1rem;">
                     {#each fc.claims as c}
                       <li>
                         <strong>{c.assessment}</strong>: {c.claim}
                         {#if c.source}<span class="muted"> — {c.source}</span>{/if}
                         <span class="muted"> ({Math.round((c.confidence ?? 0) * 100)}%)</span>
                       </li>
                     {/each}
                   </ul>
                 {/if}
               </div>
             {/if}
           </li>
         {/each}
       </ul>
    {/if}
  </section>

  <!-- Composer (only when it's my turn) -->
  {#if debate.status === 'active'}
    <section class="card">
      <h2>Your turn to speak</h2>
      {#if canPost}
        <textarea bind:value={draft} rows="4" maxlength={debate.maxCharactersPerTurn} oninput={notifyTyping}
          placeholder="Write your argument for this turn…" aria-label="Your message"></textarea>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
          <span class="muted">{draft.length}/{debate.maxCharactersPerTurn}</span>
          <button type="button" onclick={sendMessage} disabled={sending || !draft.trim()}>
            {sending ? 'Sending…' : 'Submit turn'}
          </button>
        </div>
        <div style="margin-top:0.5rem; display:flex; gap:0.35rem; flex-wrap:wrap;">
          {#each ['👍', '👎', '🔥', '💡', '❓', '🎯'] as emoji}
            <button type="button" class="btn-secondary" onclick={() => sendReaction(emoji)} style="padding:0.15rem 0.5rem;">{emoji}</button>
          {/each}
        </div>
      {:else}
        <p class="muted">You can post only during your own turn. {debate.currentTurnSide && mySide && debate.currentTurnSide !== mySide ? 'Waiting for the ' + debate.currentTurnSide + ' side.' : ''}</p>
      {/if}
      <div style="margin-top:0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
        <button type="button" class="btn-secondary" onclick={doRaiseHand} disabled={raiseHandBusy || isMyTurn}>
          Raise hand
        </button>
        <button type="button" class="btn-secondary" onclick={doPause} disabled={pausing}>Pause</button>
        <button type="button" class="btn-secondary" onclick={doComplete} disabled={completing || !!debate.currentTurnId}>
          End debate (move to judging)
        </button>
        <button type="button" class="btn-secondary" onclick={doCancel} disabled={cancelling}>Cancel debate</button>
      </div>
       {#if cancelling}
         <div style="margin-top:0.5rem;">
           <label class="sr-only" for="cancel-reason">Cancellation reason (optional, recorded)</label>
           <input id="cancel-reason" placeholder="Reason (optional, recorded)" bind:value={cancelReason} />
         </div>
       {/if}
    </section>
  {/if}

  {#if debate.status === 'paused'}
    <section class="card">
      <h2>Debate paused</h2>
      <p class="muted">No turns or messages proceed while paused.</p>
      <button type="button" onclick={doResume} disabled={resuming}>Resume debate</button>
    </section>
  {/if}

  <!-- Evidence -->
  <section class="card">
    <h2>Pinned evidence</h2>
    <p class="muted">Pin facts or sources you want the AI to consider. The AI will not invent these.</p>
    {#if evidenceList.length}
      <ul style="padding-left:1.1rem;">
        {#each evidenceList as ev (ev.id)}
          <li><span class="tag {ev.side}">{ev.side}</span> {ev.claim}{ev.source ? ` — ${ev.source}` : ''}</li>
        {/each}
      </ul>
    {:else}
      <p class="muted">No evidence pinned yet.</p>
    {/if}
    <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.5rem;">
      <label class="sr-only" for="evidence-claim">Evidence claim or source</label>
      <input id="evidence-claim" placeholder="Claim or source" bind:value={evidenceClaim} style="flex:2; min-width:200px;" />
      <label class="sr-only" for="evidence-source">Evidence source URL or reference (optional)</label>
      <input id="evidence-source" placeholder="Source URL/reference (optional)" bind:value={evidenceSource} style="flex:1; min-width:160px;" />
      <label class="sr-only" for="evidence-side">Evidence side</label>
      <select id="evidence-side" bind:value={evidenceSide} style="width:auto;">
        <option value="neutral">Neutral</option>
        <option value="affirmative">Affirmative</option>
        <option value="negative">Negative</option>
      </select>
      <button type="button" onclick={pinEvidence} disabled={evidenceBusy || !evidenceClaim.trim()}>Pin</button>
    </div>
  </section>

  <!-- Lawyer panel (private) -->
  <section class="card">
    <h2>
      Private Lawyer
      <span class="tag neutral" style="margin-left:0.5rem;">Private to you</span>
    </h2>
    {#if !lawyerOpen}
      <button type="button" class="btn-secondary" onclick={() => (lawyerOpen = true)}>Open Lawyer</button>
    {:else}
      <textarea bind:value={lawyerRequest} rows="3" placeholder="Ask your private Lawyer for help…" aria-label="Lawyer request"></textarea>
      <div style="margin:0.5rem 0;">
        <button type="button" onclick={askLawyer} disabled={lawyerBusy || !lawyerRequest.trim()}>
          {lawyerBusy ? 'Thinking…' : 'Ask'}
        </button>
        <button type="button" class="btn-secondary" onclick={() => (lawyerOpen = false)}>Close</button>
      </div>
      {#if lawyerError}<p class="error" role="alert">{lawyerError}</p>{/if}
      {#if lawyerAdvice}
        <div class="card" style="background:#fafbfc;">
          <p><strong>Type:</strong> {lawyerAdvice.assistanceType}</p>
          <p style="white-space:pre-wrap;">{lawyerAdvice.advice}</p>
          {#if lawyerAdvice.uncertainty}<p class="muted"><em>Uncertainty: {lawyerAdvice.uncertainty}</em></p>{/if}
          {#if lawyerAdvice.evidenceSuggestions?.length}
            <p><strong>Evidence to verify:</strong></p>
            <ul>
              {#each lawyerAdvice.evidenceSuggestions as s}
                <li>{s.claim}{s.verificationNeeded ? ` — ${s.verificationNeeded}` : ''}</li>
              {/each}
            </ul>
          {/if}
        </div>
      {/if}
    {/if}
  </section>
{/if}
