// Thin authenticated API client. The server is the source of truth; this only
// performs network calls and returns parsed responses or throws ApiError.

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const hasBody = options.body !== undefined && options.body !== null && options.body !== '';
  const res = await fetch(path, {
    credentials: 'include',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    throw new ApiError(res.status, (data && data.error) || res.statusText);
  }

  return data as T;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  role?: string;
}

export const api = {
  me: () => request<{ user: AuthUser }>('/api/auth/me'),

  signIn: (email: string, password: string) =>
    request<{ user: AuthUser }>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signUp: (email: string, password: string, name: string, invitationCode: string) =>
    request<{ user: AuthUser; message: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, invitationCode }),
    }),

  signOut: () => request('/api/auth/signout', { method: 'POST' }),

  forgotPassword: (email: string) =>
    request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token: string, newPassword: string) =>
    request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  listDebates: () => request<any[]>('/api/debates'),

  getDebate: (id: string) => request<any>(`/api/debates/${id}`),

  createDebate: (topic: string, description: string | undefined, opponentEmail: string) =>
    request<any>('/api/debates', {
      method: 'POST',
      body: JSON.stringify({ topic, description, opponentEmail }),
    }),

  joinDebate: (id: string) =>
    request<any>(`/api/debates/${id}/join`, { method: 'POST' }),

  postMessage: (id: string, content: string) =>
    request<any>(`/api/debates/${id}/message`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  raiseHand: (id: string) =>
    request<any>(`/api/debates/${id}/raise-hand`, { method: 'POST' }),

  completeDebate: (id: string) =>
    request<any>(`/api/debates/${id}/complete`, { method: 'POST' }),

  pauseDebate: (id: string) =>
    request<any>(`/api/debates/${id}/pause`, { method: 'POST' }),

  resumeDebate: (id: string) =>
    request<any>(`/api/debates/${id}/resume`, { method: 'POST' }),

  cancelDebate: (id: string, reason?: string, category?: string) =>
    request<any>(`/api/debates/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason, category }),
    }),

  requestLawyer: (id: string, requestText: string) =>
    request<{ id: string; advice: any }>(`/api/debates/${id}/lawyer`, {
      method: 'POST',
      body: JSON.stringify({ request: requestText }),
    }),

  judgeDebate: (id: string) =>
    request<any>(`/api/debates/${id}/judge`, { method: 'POST' }),

  factCheckMessage: (id: string, messageId: string) =>
    request<{ id: string; verdict: string; claims: any[] }>(
      `/api/debates/${id}/messages/${messageId}/fact-check`,
      { method: 'POST' },
    ),

  getReport: (id: string) => request<any>(`/api/debates/${id}/report`),

  getAnalytics: () => request<any>('/api/admin/analytics'),

  pinEvidence: (id: string, claim: string, source?: string, side?: string) =>
    request<any>(`/api/debates/${id}/evidence`, {
      method: 'POST',
      body: JSON.stringify({ claim, source, side }),
    }),

  exportDebate: (id: string) =>
    request<any>(`/api/debates/${id}/export`, { method: 'POST' }),

  importDebate: (data: unknown) =>
    request<any>(`/api/imports`, { method: 'POST', body: JSON.stringify({ data }) }),
};

// Safely resolve a post-login redirect target. Only allows same-origin relative
// paths (starting with a single "/", and not "//" or containing "://") to
// prevent open-redirect phishing via a crafted ?redirect= query parameter.
export function safeRedirect(target: string | null | undefined, fallback = '/debates'): string {
  if (!target) return fallback;
  if (target.startsWith('/') && !target.startsWith('//') && !target.includes('://')) {
    return target;
  }
  return fallback;
}
