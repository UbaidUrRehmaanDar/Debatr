/**
 * Smoke test for the Resend email integration. Sends a verification-style email
 * through the real Resend client to confirm the API key and from-address are
 * valid and mail is deliverable.
 *
 * Usage (from apps/api):
 *   $env:TEST_EMAIL_TO="you@example.com"
 *   npx tsx scripts/test-email.ts
 *
 * Note: with the Resend sandbox sender (`onboarding@resend.dev`) the recipient
 * must be a verified contact in the Resend dashboard, or the domain must be
 * verified for arbitrary recipients.
 */
import { sendEmail } from '../src/email/index.js';
import { config } from '../src/config/env.js';

async function main() {
  if (!config.load()) {
    console.error('Config invalid; check .env');
    process.exit(1);
  }
  const to = process.env.TEST_EMAIL_TO;
  if (!to) {
    console.error('Set TEST_EMAIL_TO to the inbox you want to confirm delivery to.');
    process.exit(1);
  }
  const token = 'demo-token-' + Date.now();
  const url = `${config.webOrigin}/verify-email?token=${token}`;
  console.log(`Sending verification email to ${to} via ${config.emailFrom} ...`);
  await sendEmail({
    to,
    subject: 'Verify your Debatr email',
    text: `Welcome to Debatr. Verify your email:\n\n${url}`,
    html: `<p>Welcome to Debatr. Verify your email:</p><p><a href="${url}">${url}</a></p>`,
  });
  console.log('Sent successfully — check your inbox (and spam).');
}

main().catch((err) => {
  console.error('Email send failed:', err);
  process.exit(1);
});
