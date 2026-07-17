<script lang="ts">
  import { logout } from '$lib/stores';
  import '../app.css';
  let { children, data } = $props();
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  async function doLogout() {
    await logout();
    goto('/sign-in');
  }

  // Prefer the per-request user from load (SSR-safe) over the shared module
  // store, eliminating cross-request auth leakage.
  let user = $derived(data.user);
  let path = $derived($page.url.pathname);
  const PUBLIC = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password'];
  let showNav = $derived(user && !PUBLIC.some((p) => path.startsWith(p)));
</script>

{#if showNav}
  <header class="topbar">
    <a href="/debates" class="brand">Debatr</a>
    <nav aria-label="Primary">
      <a href="/debates" aria-current={path.startsWith('/debates') ? 'page' : undefined}>Debates</a>
      <a href="/debates/new" aria-current={path === '/debates/new' ? 'page' : undefined}>New</a>
      <a href="/imports/new" aria-current={path === '/imports/new' ? 'page' : undefined}>Import</a>
    </nav>
    <div class="account">
      <span>{user?.name || user?.email}</span>
      <button type="button" onclick={doLogout}>Sign out</button>
    </div>
  </header>
{/if}

<a href="#main" class="skip-link">Skip to content</a>

<main id="main" class="container" tabindex="-1">
  {@render children()}
</main>

<style>
  .topbar {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid #d8dde3;
    background: #fff;
  }
  .brand { font-weight: 700; font-size: 1.1rem; text-decoration: none; color: #1a1a1a; }
  nav { display: flex; gap: 1rem; }
  nav a { text-decoration: none; color: #2b5fb3; }
  .account { margin-left: auto; display: flex; align-items: center; gap: 0.75rem; }
  .account button {
    border: 1px solid #ccd2d9; background: #f5f7fa; border-radius: 6px;
    padding: 0.35rem 0.7rem; cursor: pointer;
  }
  .container { max-width: 960px; margin: 0 auto; padding: 1.5rem; }
</style>
