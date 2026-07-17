<script lang="ts">
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let email = $state('');
  let name = $state('');
  let password = $state('');
  let code = $state($page.url.searchParams.get('code') || '');
  let error = $state('');
  let message = $state('');
  let loading = $state(false);

  async function submit(e: Event) {
    e.preventDefault();
    error = '';
    message = '';
    loading = true;
    try {
      const res = await api.signUp(email, password, name, code);
      message = res.message;
      goto('/debates', { replaceState: true });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Sign up failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="card" style="max-width: 420px; margin: 2rem auto;">
  <h1>Create your account</h1>
  <p class="muted">Invitation-only. The code must match the email it was sent to.</p>
  <form onsubmit={submit}>
    <label for="code">Invitation code</label>
    <input id="code" bind:value={code} required />

    <label for="name">Name</label>
    <input id="name" bind:value={name} required />

    <label for="email">Email</label>
    <input id="email" type="email" bind:value={email} required autocomplete="username" />

    <label for="password">Password</label>
    <input id="password" type="password" bind:value={password} required autocomplete="new-password" minlength="8" />

    {#if error}<p class="error" role="alert">{error}</p>{/if}
    {#if message}<p class="muted" role="status">{message}</p>{/if}

    <div style="margin-top: 1rem;">
      <button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
    </div>
  </form>
  <p class="muted" style="margin-top: 1rem;"><a href="/sign-in">Already have an account? Sign in</a>.</p>
</div>
