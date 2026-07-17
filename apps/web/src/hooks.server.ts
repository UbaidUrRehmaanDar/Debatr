import type { Handle } from '@sveltejs/kit';

// Security headers applied to every server response. The Content-Security-Policy
// itself is configured in svelte.config.js (kit.csp, nonce mode) — SvelteKit
// injects a per-request nonce into its inline scripts and sets the CSP header.
// - no-store prevents authenticated pages from being cached on shared/locked
//   machines (back-button / disk-cache disclosure of another user's data).
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Never cache authenticated or app pages.
  response.headers.set('cache-control', 'no-store');
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('referrer-policy', 'no-referrer');
  response.headers.set('x-frame-options', 'DENY');

  return response;
};
