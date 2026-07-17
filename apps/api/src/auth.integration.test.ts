import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';

// Capture verification emails via the injectable transport (no real delivery).
const sentEmails: any[] = [];
const { init, getAuth } = await import('./auth/index.js');
const { setEmailSender } = await import('./email/index.js');
const { getDb } = await import('./db/index.js');
const { invitations, users } = await import('./db/schema/index.js');
const { setupTestDb, teardownTestDb, truncateAll, hasTestDb } = await import('../test/setup.js');
const { randomUUID } = await import('crypto');

const maybe = hasTestDb ? describe : describe.skip;

maybe('email verification integration (real DB, captured sender)', () => {
  beforeAll(async () => {
    await setupTestDb();
    setEmailSender(async (m: any) => {
      sentEmails.push(m);
    });
    await init();
  });
  afterAll(async () => {
    setEmailSender(null);
    await teardownTestDb();
  });
  afterEach(async () => {
    sentEmails.length = 0;
    await truncateAll();
  });

  it('sends a verification email pointing at the web app on signup', async () => {
    const auth = getAuth();
    const email = `verify-${randomUUID().slice(0, 8)}@example.com`;

    // Seed an inviter user (invitations.createdBy references users) and a
    // matching invitation (signup requires one).
    const inviterId = randomUUID();
    await getDb().insert(users).values({
      id: inviterId,
      email: `inviter-${randomUUID().slice(0, 8)}@example.com`,
      name: 'Inviter',
    });
    await getDb().insert(invitations).values({
      id: randomUUID(),
      code: 'CODE123',
      email,
      createdBy: inviterId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    });

    const result: any = await auth.api.signUpEmail({
      body: { email, password: 'password123', name: 'Verifier' },
      headers: new Headers({ host: 'localhost:3000' }),
    });

    expect(result?.user?.email).toBe(email);

    // Better Auth sends the verification email asynchronously; allow it to flush.
    await new Promise((r) => setTimeout(r, 500));

    // The verification email was triggered.
    expect(sentEmails.length).toBe(1);
    const sent = sentEmails[0];
    expect(sent.to).toBe(email);
    expect(sent.subject.toLowerCase()).toContain('verify');

    // The link points at the web app (not the API origin) and carries a token.
    expect(sent.text).toContain('/verify-email?token=');
    expect(sent.text).not.toContain('localhost:3000/verify-email');
  });
});
