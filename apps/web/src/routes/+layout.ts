import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

const PUBLIC_ROUTES = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/verify-email'];

export const load: LayoutLoad = async ({ url, fetch }) => {
  const isPublic = PUBLIC_ROUTES.some((p) => url.pathname.startsWith(p));

  // Read the session using the SvelteKit-provided fetch, which forwards the
  // request cookies on SSR. This keeps auth per-request and avoids the
  // cross-request leakage of a module-level shared store.
  let user = null;
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      user = data.user;
    }
  } catch {
    user = null;
  }

  if (!user && !isPublic) {
    throw redirect(303, '/sign-in');
  }
  if (user && isPublic && url.pathname !== '/verify-email') {
    throw redirect(303, '/debates');
  }

  return { user };
};
