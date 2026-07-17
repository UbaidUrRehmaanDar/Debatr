<script lang="ts">
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let token = $state($page.url.searchParams.get('token') || '');
  let password = $state('');
  let error = $state('');
  let message = $state('');
  let loading = $state(false);

  async function submit(e: Event) {
    e.preventDefault();
    error = '';
    message = '';
    loading = true;
    try {
      await api.resetPassword(token, password);
      message = 'Password updated. You can now sign in.';
      goto('/sign-in', { replaceState: true });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Reset failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="card" style="max-width: 420px; margin: 2rem auto;">
  <h1>Choose a new password</h1>
  <form onsubmit={submit}>
    <label for="token">Reset token</label>
    <input id="token" bind:value={token} required />

    <label for="password">New password</label>
    <input id="password" type="password" bind:value={password} required autocomplete="new-password" minlength="8" />

    {#if error}<p class="error" role="alert">{error}</p>{/if}
    {#if message}<p class="muted" role="status">{message}</p>{/if}

    <div style="margin-top: 1rem;">
      <button type="submit" disabled={loading}>{loading ? 'Updating…' : 'Update password'}</button>
    </div>
  </form>
</div>
