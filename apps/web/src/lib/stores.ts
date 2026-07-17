import { api } from './api';

// Client-side sign-out: clears the session cookie via the API and lets the
// caller navigate. Auth state is sourced per-request from +layout.ts's load
// (data.user), so there is no shared module-level user store to reset.
export async function logout() {
  await api.signOut();
}
