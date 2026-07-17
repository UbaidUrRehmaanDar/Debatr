import { Resend } from 'resend';
import { config } from '../config/env.js';

// Modular email sender. Better Auth does not ship a transport; it calls back
// into this module. Only this file knows about the Resend client, so swapping
// providers later means changing just this module (and the env vars).
let client: Resend | null = null;

function getClient(): Resend {
  if (!client) {
    client = new Resend(config.resendApiKey);
  }
  return client;
}

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// The actual transport. Defaults to the Resend client but can be swapped (e.g.
// in tests) via setEmailSender so we can assert email flows without delivering
// real mail.
type Sender = (message: EmailMessage) => Promise<void>;
let sender: Sender = sendViaResend;

async function sendViaResend(message: EmailMessage): Promise<void> {
  const { error } = await getClient().emails.send({
    from: config.emailFrom,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  if (error) {
    throw new Error(`Failed to send email to ${message.to}: ${error.message}`);
  }
}

/** Override the email transport (used by tests). */
export function setEmailSender(next: Sender | null): void {
  sender = next ?? sendViaResend;
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  await sender(message);
}
