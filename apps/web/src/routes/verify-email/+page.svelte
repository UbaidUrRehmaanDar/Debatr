<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let token = $state('');
  let status = $state<'idle' | 'verifying' | 'success' | 'error'>('idle');
  let message = $state('');

  async function verify(t: string) {
    status = 'verifying';
    message = '';
    try {
      const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(t)}`, {
        method: 'GET',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Verification failed');
      }
      status = 'success';
    } catch (err) {
      status = 'error';
      message = err instanceof Error ? err.message : 'Verification failed';
    }
  }

  onMount(() => {
    const t = $page.url.searchParams.get('token') || '';
    token = t;
    if (t) {
      verify(t);
    } else {
      status = 'error';
      message = 'No verification token found in the link.';
    }
  });
</script>

<div class="card" style="max-width: 480px; margin: 2rem auto;">
  <h1>Verify your email</h1>

  {#if status === 'verifying'}
    <p class="muted">Verifying…</p>
  {:else if status === 'success'}
    <p>Your email is verified. You can now sign in.</p>
    <a href="/sign-in" class="btn-secondary" style="display:inline-block; margin-top:0.5rem;">Continue to sign in</a>
  {:else if status === 'error'}
    <p class="error" role="alert">{message}</p>
    {#if !token}
      <p class="muted">The link may be incomplete. Check your email and try again.</p>
    {/if}
  {:else}
    <p class="muted">Preparing to verify…</p>
  {/if}
</div>
