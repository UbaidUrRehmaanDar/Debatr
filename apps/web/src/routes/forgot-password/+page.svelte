<script lang="ts">
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';

  let email = $state('');
  let error = $state('');
  let message = $state('');
  let loading = $state(false);

  async function submit(e: Event) {
    e.preventDefault();
    error = '';
    message = '';
    loading = true;
    try {
      await api.forgotPassword(email);
      message = 'If an account exists, a reset link has been sent.';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Request failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="card" style="max-width: 420px; margin: 2rem auto;">
  <h1>Reset password</h1>
  <form onsubmit={submit}>
    <label for="email">Email</label>
    <input id="email" type="email" bind:value={email} required autocomplete="username" />
    {#if error}<p class="error" role="alert">{error}</p>{/if}
    {#if message}<p class="muted" role="status">{message}</p>{/if}
    <div style="margin-top: 1rem;">
      <button type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</button>
    </div>
  </form>
  <p class="muted" style="margin-top: 1rem;"><a href="/sign-in">Back to sign in</a>.</p>
</div>
