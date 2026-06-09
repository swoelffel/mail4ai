import { WebhookVerificationError } from './errors.js';
import type { AgentMailWebhookPayload } from './payload.js';
import { parseAgentMailWebhookPayload } from './payload.js';
import type { ReplayStore } from './replay-store.js';
import { verifyWebhookSignature } from './signature.js';

const DEFAULT_TOLERANCE_SECONDS = 300;

export interface HandleAgentMailWebhookOptions {
  secret: string;
  rawBody: string;
  headers: Record<string, string | string[] | undefined>;
  replayStore: ReplayStore;
  now?: Date;
  toleranceSeconds?: number;
  onEmailReceived: (payload: AgentMailWebhookPayload) => Promise<void> | void;
}

export async function handleAgentMailWebhook(
  options: HandleAgentMailWebhookOptions,
): Promise<AgentMailWebhookPayload> {
  const event = getHeader(options.headers, 'x-agentmail-event');
  const delivery = getHeader(options.headers, 'x-agentmail-delivery');
  const timestamp = getHeader(options.headers, 'x-agentmail-timestamp');
  const signatureHeader = getHeader(options.headers, 'x-agentmail-signature');

  if (event !== 'email.received') {
    throw new WebhookVerificationError('missing_header', 'X-AgentMail-Event must be email.received.');
  }

  verifyWebhookSignature({
    secret: options.secret,
    timestamp,
    rawBody: options.rawBody,
    signatureHeader,
    now: options.now,
    toleranceSeconds: options.toleranceSeconds,
  });

  const parsedJson = parseJson(options.rawBody);
  const payload = parseAgentMailWebhookPayload(parsedJson);

  if (payload.event_id !== delivery) {
    throw new WebhookVerificationError('event_id_mismatch', 'Payload event_id must match X-AgentMail-Delivery.');
  }

  if (await options.replayStore.has(payload.event_id)) {
    throw new WebhookVerificationError('replayed_event', 'Webhook event has already been processed.');
  }

  await options.replayStore.remember(
    payload.event_id,
    options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS,
  );
  await options.onEmailReceived(payload);

  return payload;
}

function getHeader(headers: Record<string, string | string[] | undefined>, name: string): string {
  const match = Object.entries(headers).find(([key]) => key.toLowerCase() === name);
  const value = match?.[1];

  if (Array.isArray(value)) {
    if (value.length === 0 || value[0] === undefined) {
      throw new WebhookVerificationError('missing_header', `Missing ${name} header.`);
    }
    return value[0];
  }

  if (typeof value !== 'string' || value === '') {
    throw new WebhookVerificationError('missing_header', `Missing ${name} header.`);
  }

  return value;
}

function parseJson(rawBody: string): unknown {
  try {
    return JSON.parse(rawBody);
  } catch {
    throw new WebhookVerificationError('invalid_payload', 'Webhook body must be valid JSON.');
  }
}
