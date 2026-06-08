import { WebhookVerificationError } from './errors.js';

export interface AgentMailWebhookPayload {
  event_type: 'email.received';
  event_id: string;
  agent_id: string;
  email_id: string;
  thread_id: string | null;
  from: string;
  subject: string | null;
  received_at: string | null;
  has_attachments: boolean;
  trust_boundary: string;
  agent_instruction: string;
}

export function parseAgentMailWebhookPayload(input: unknown): AgentMailWebhookPayload {
  if (!isRecord(input)) {
    throwInvalidPayload('Payload must be a JSON object.');
  }

  if (input.event_type !== 'email.received') {
    throwInvalidPayload('Payload event_type must be email.received.');
  }

  assertNonEmptyString(input.event_id, 'event_id');
  assertNonEmptyString(input.agent_id, 'agent_id');
  assertNonEmptyString(input.email_id, 'email_id');
  assertNullableString(input.thread_id, 'thread_id');
  assertNonEmptyString(input.from, 'from');
  assertNullableString(input.subject, 'subject');
  assertNullableString(input.received_at, 'received_at');
  assertNonEmptyString(input.trust_boundary, 'trust_boundary');
  assertNonEmptyString(input.agent_instruction, 'agent_instruction');

  if (typeof input.has_attachments !== 'boolean') {
    throwInvalidPayload('Payload has_attachments must be a boolean.');
  }

  return {
    event_type: 'email.received',
    event_id: input.event_id,
    agent_id: input.agent_id,
    email_id: input.email_id,
    thread_id: input.thread_id,
    from: input.from,
    subject: input.subject,
    received_at: input.received_at,
    has_attachments: input.has_attachments,
    trust_boundary: input.trust_boundary,
    agent_instruction: input.agent_instruction,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertNonEmptyString(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throwInvalidPayload(`Payload ${field} must be a non-empty string.`);
  }
}

function assertNullableString(value: unknown, field: string): asserts value is string | null {
  if (value !== null && typeof value !== 'string') {
    throwInvalidPayload(`Payload ${field} must be a string or null.`);
  }
}

function throwInvalidPayload(message: string): never {
  throw new WebhookVerificationError('invalid_payload', message);
}
