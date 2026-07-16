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

export async function sendEmail(message: EmailMessage): Promise<void> {
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
