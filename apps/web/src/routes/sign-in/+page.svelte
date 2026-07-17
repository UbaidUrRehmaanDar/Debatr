<script lang="ts">
  import { api, safeRedirect } from '$lib/api';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  const redirectTo = $derived(safeRedirect($page.url.searchParams.get('redirect')));

  async function submit(e: Event) {
    e.preventDefault();
    error = '';
    loading = true;
    try {
      await api.signIn(email, password);
      goto(redirectTo, { replaceState: true });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Sign in failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="card" style="max-width: 420px; margin: 2rem auto;">
  <h1>Sign in</h1>
  <form onsubmit={submit}>
    <label for="email">Email</label>
    <input id="email" type="email" bind:value={email} required autocomplete="username" />

    <label for="password">Password</label>
    <input id="password" type="password" bind:value={password} required autocomplete="current-password" />

    {#if error}<p class="error" role="alert">{error}</p>{/if}

    <div style="margin-top: 1rem; display: flex; gap: 0.5rem; align-items: center;">
      <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      <a href="/forgot-password">Forgot password?</a>
    </div>
  </form>
  <p class="muted" style="margin-top: 1rem;">
    No account? <a href="/sign-up">Request access with an invitation code</a>.
  </p>
</div>
