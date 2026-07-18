import type { Handle } from '@sveltejs/kit';

// Security headers applied to every server response. The Content-Security-Policy
// itself is configured in svelte.config.js (kit.csp, nonce mode) — SvelteKit
// injects a per-request nonce into its inline scripts and sets the CSP header.
// - no-store prevents authenticated pages from being cached on shared/locked
//   machines (back-button / disk-cache disclosure of another user's data).
export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Apply security headers defensively. Proxied /api responses can carry
  // immutable headers (e.g. from the Fastify backend), where .set() throws
  // "immutable"; guard so an upstream header quirk never 500s the page.
  const setHeader = (key: string, value: string) => {
    try {
      response.headers.set(key, value);
    } catch {
      /* header is immutable or not settable — leave as-is */
    }
  };

  // Never cache authenticated or app pages.
  setHeader('cache-control', 'no-store');
  setHeader('x-content-type-options', 'nosniff');
  setHeader('referrer-policy', 'no-referrer');
  setHeader('x-frame-options', 'DENY');

  return response;
};
