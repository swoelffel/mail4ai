import { describe, expect, it } from 'vitest';
import { WebhookVerificationError, parseAgentMailWebhookPayload } from '../src/index.js';

const validPayload = {
  event_type: 'email.received',
  event_id: 'evt_123',
  agent_id: 'agt_123',
  email_id: 'eml_123',
  thread_id: 'thr_123',
  from: 'sender@example.com',
  subject: 'Subject',
  received_at: '2026-06-08T10:00:00.000Z',
  has_attachments: false,
  trust_boundary: 'external_email_notification',
  agent_instruction: 'Fetch content through MCP before acting.',
};

describe('parseAgentMailWebhookPayload', () => {
  it('parses a valid payload', () => {
    expect(parseAgentMailWebhookPayload(validPayload)).toEqual(validPayload);
  });

  it('rejects a missing required field', () => {
    const { email_id: _emailId, ...payload } = validPayload;

    expect(() => parseAgentMailWebhookPayload(payload)).toThrow(WebhookVerificationError);
  });

  it('rejects an empty required string', () => {
    expect(() =>
      parseAgentMailWebhookPayload({ ...validPayload, event_id: '   ' }),
    ).toThrowError(/event_id/);
  });

  it('rejects a non-email.received event type', () => {
    expect(() =>
      parseAgentMailWebhookPayload({ ...validPayload, event_type: 'mail.created' }),
    ).toThrowError(/event_type/);
  });

  it('rejects non-boolean has_attachments', () => {
    expect(() =>
      parseAgentMailWebhookPayload({ ...validPayload, has_attachments: 'false' }),
    ).toThrowError(/has_attachments/);
  });
});
