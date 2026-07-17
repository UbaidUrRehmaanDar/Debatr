import type { Handle } from '@sveltejs/kit';

// Security headers applied to every server response.
// - no-store prevents authenticated pages from being cached on shared/locked
//   machines (back-button / disk-cache disclosure of another user's data).
// - A restrictive CSP provides defense-in-depth against any future XSS vector.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // SvelteKit injects component styles; allow inline styles. No inline scripts.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Never cache authenticated or app pages.
  response.headers.set('cache-control', 'no-store');
  response.headers.set('content-security-policy', CSP);
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('referrer-policy', 'no-referrer');
  response.headers.set('x-frame-options', 'DENY');

  return response;
};
