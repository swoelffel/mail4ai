import { describe, expect, it, vi } from 'vitest';
import {
  InMemoryReplayStore,
  WebhookVerificationError,
  handleAgentMailWebhook,
  signWebhookPayload,
} from '../src/index.js';

const secret = 'test-webhook-secret';
const now = new Date('2026-06-08T10:00:00.000Z');
const timestamp = String(Math.floor(now.getTime() / 1000));
const payload = {
  event_type: 'email.received',
  event_id: 'evt_123',
  agent_id: 'agt_123',
  email_id: 'eml_123',
  thread_id: null,
  from: 'sender@example.com',
  subject: null,
  received_at: null,
  has_attachments: false,
  trust_boundary: 'external_email_notification',
  agent_instruction: 'Fetch content through MCP before acting.',
};
const rawBody = JSON.stringify(payload);

function headers(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    'X-AgentMail-Event': 'email.received',
    'X-AgentMail-Delivery': payload.event_id,
    'X-AgentMail-Timestamp': timestamp,
    'X-AgentMail-Signature': signWebhookPayload(secret, timestamp, rawBody),
    ...overrides,
  };
}

describe('handleAgentMailWebhook', () => {
  it('calls the handler once for a valid event', async () => {
    const onEmailReceived = vi.fn();

    await expect(
      handleAgentMailWebhook({
        secret,
        rawBody,
        headers: headers(),
        replayStore: new InMemoryReplayStore(),
        now,
        onEmailReceived,
      }),
    ).resolves.toEqual(payload);

    expect(onEmailReceived).toHaveBeenCalledTimes(1);
    expect(onEmailReceived).toHaveBeenCalledWith(payload);
  });

  it('does not call the handler for invalid signatures', async () => {
    const onEmailReceived = vi.fn();

    await expect(
      handleAgentMailWebhook({
        secret,
        rawBody,
        headers: headers({ 'X-AgentMail-Signature': signWebhookPayload('wrong', timestamp, rawBody) }),
        replayStore: new InMemoryReplayStore(),
        now,
        onEmailReceived,
      }),
    ).rejects.toThrow(WebhookVerificationError);

    expect(onEmailReceived).not.toHaveBeenCalled();
  });

  it('does not call the handler for replayed events', async () => {
    const replayStore = new InMemoryReplayStore();
    const onEmailReceived = vi.fn();

    await handleAgentMailWebhook({
      secret,
      rawBody,
      headers: headers(),
      replayStore,
      now,
      onEmailReceived,
    });

    await expect(
      handleAgentMailWebhook({
        secret,
        rawBody,
        headers: headers(),
        replayStore,
        now,
        onEmailReceived,
      }),
    ).rejects.toThrowError(/already/);

    expect(onEmailReceived).toHaveBeenCalledTimes(1);
  });

  it('requires delivery id to match payload event_id', async () => {
    const onEmailReceived = vi.fn();

    await expect(
      handleAgentMailWebhook({
        secret,
        rawBody,
        headers: headers({ 'X-AgentMail-Delivery': 'evt_other' }),
        replayStore: new InMemoryReplayStore(),
        now,
        onEmailReceived,
      }),
    ).rejects.toThrowError(/event_id/);

    expect(onEmailReceived).not.toHaveBeenCalled();
  });
});
