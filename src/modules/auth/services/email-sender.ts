/**
 * Email sender helper — publishes email send requests to the emailsender
 * microservice via NATS.
 *
 * The emailsender microservice subscribes to `emailsender.send` and handles
 * template rendering + Brevo API delivery. This helper is fire-and-forget:
 * it publishes the request and does NOT wait for a response.
 *
 * If NATS is not connected, the email is silently skipped (logged as a warning).
 * Email delivery is NOT critical to the invitation flow — the token + OTP
 * still work, the user just won't receive the email. The admin can resend.
 */

import { NatsClient } from "@primebrick/sdk";
import { randomUUID } from "crypto";

export interface SendEmailParams {
  template_code: string;
  language_iso: string;
  to: string[];
  variables?: Record<string, unknown>;
}

/**
 * Publish an email send request to the emailsender microservice via NATS.
 * Fire-and-forget — does not wait for delivery confirmation.
 */
export async function sendEmail(params: SendEmailParams): Promise<void> {
  if (!NatsClient.isConnected()) {
    console.warn(
      `[email] NATS not connected — skipping email send (template: ${params.template_code}, to: ${params.to.join(", ")})`,
    );
    return;
  }

  const request = {
    requestId: randomUUID(),
    templateCode: params.template_code,
    languageIso: params.language_iso,
    to: params.to,
    variables: params.variables,
  };

  try {
    await NatsClient.publish("emailsender.send", request);
  } catch (err) {
    console.error(
      `[email] Failed to publish email send request to NATS (template: ${params.template_code}):`,
      err,
    );
  }
}
