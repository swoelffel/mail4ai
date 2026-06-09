import { signWebhookPayload, type AgentMailWebhookPayload } from '@mail4ai/webhook-kit';
import { describe, expect, it, vi } from 'vitest';
import type { BridgeConfig } from '../src/config.js';
import { createServer } from '../src/server.js';

const now = new Date('2026-06-09T10:00:00.000Z');
const timestamp = `${Math.floor(now.getTime() / 1000)}`;
const secret = 'placeholder_agentmail_webhook_secret';

const config: BridgeConfig = {
  agentMailWebhookSecret: secret,
  openClawWebhookUrl: 'https://openclaw.example.invalid/hooks/agent',
  openClawWebhookToken: 'placeholder_openclaw_token',
  openClawAgentId: 'hooks',
  mail4AiMcpUrl: 'https://mcp.mail4ai.eu/mcp',
  port: 8787,
  agentMailWebhookToleranceSeconds: 300,
  openClawSessionPrefix: 'mail4ai',
};

const payload: AgentMailWebhookPayload = {
  event_type: 'email.received',
  event_id: 'evt_example',
  agent_id: 'agent_example',
  email_id: 'eml_example',
  thread_id: 'thr_example',
  from: 'sender@example.invalid',
  subject: 'Example',
  received_at: '2026-06-09T10:00:00.000Z',
  has_attachments: false,
  trust_boundary: 'external_untrusted_email',
  agent_instruction: 'Fetch content through MCP before acting.',
};

function signedHeaders(rawBody: string, override: Record<string, string> = {}) {
  return {
    'content-type': 'application/json',
    'x-agentmail-event': 'email.received',
    'x-agentmail-delivery': payload.event_id,
    'x-agentmail-timestamp': timestamp,
    'x-agentmail-signature': signWebhookPayload(secret, timestamp, rawBody),
    ...override,
  };
}

describe('createServer', () => {
  it('returns health status', async () => {
    const app = createServer({ config, now: () => now, onEmailReceived: vi.fn() });

    const response = await app.inject({ method: 'GET', url: '/healthz' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true });
  });

  it('forwards a verified webhook to OpenClaw', async () => {
    const onEmailReceived = vi.fn().mockResolvedValue(undefined);
    const app = createServer({ config, now: () => now, onEmailReceived });
    const rawBody = JSON.stringify(payload);

    const response = await app.inject({
      method: 'POST',
      url: '/agentmail/webhook',
      headers: signedHeaders(rawBody),
      payload: rawBody,
    });

    expect(response.statusCode).toBe(202);
    expect(onEmailReceived).toHaveBeenCalledOnce();
    expect(onEmailReceived).toHaveBeenCalledWith(payload);
  });

  it('does not call OpenClaw for invalid signatures', async () => {
    const onEmailReceived = vi.fn();
    const app = createServer({ config, now: () => now, onEmailReceived });
    const rawBody = JSON.stringify(payload);

    const response = await app.inject({
      method: 'POST',
      url: '/agentmail/webhook',
      headers: signedHeaders(rawBody, { 'x-agentmail-signature': 'sha256=' + '0'.repeat(64) }),
      payload: rawBody,
    });

    expect(response.statusCode).toBe(401);
    expect(onEmailReceived).not.toHaveBeenCalled();
  });

  it('does not call OpenClaw for stale timestamps', async () => {
    const onEmailReceived = vi.fn();
    const staleTimestamp = `${Math.floor(now.getTime() / 1000) - 1000}`;
    const rawBody = JSON.stringify(payload);
    const app = createServer({ config, now: () => now, onEmailReceived });

    const response = await app.inject({
      method: 'POST',
      url: '/agentmail/webhook',
      headers: signedHeaders(rawBody, {
        'x-agentmail-timestamp': staleTimestamp,
        'x-agentmail-signature': signWebhookPayload(secret, staleTimestamp, rawBody),
      }),
      payload: rawBody,
    });

    expect(response.statusCode).toBe(401);
    expect(onEmailReceived).not.toHaveBeenCalled();
  });

  it('does not call OpenClaw for malformed payloads', async () => {
    const onEmailReceived = vi.fn();
    const app = createServer({ config, now: () => now, onEmailReceived });
    const rawBody = '{';

    const response = await app.inject({
      method: 'POST',
      url: '/agentmail/webhook',
      headers: signedHeaders(rawBody),
      payload: rawBody,
    });

    expect(response.statusCode).toBe(400);
    expect(onEmailReceived).not.toHaveBeenCalled();
  });

  it('rejects replayed events', async () => {
    const onEmailReceived = vi.fn().mockResolvedValue(undefined);
    const app = createServer({ config, now: () => now, onEmailReceived });
    const rawBody = JSON.stringify(payload);
    const request = {
      method: 'POST' as const,
      url: '/agentmail/webhook',
      headers: signedHeaders(rawBody),
      payload: rawBody,
    };

    expect((await app.inject(request)).statusCode).toBe(202);
    expect((await app.inject(request)).statusCode).toBe(409);
    expect(onEmailReceived).toHaveBeenCalledOnce();
  });

  it('maps OpenClaw failures to 502', async () => {
    const onEmailReceived = vi.fn().mockRejectedValue(new Error('OpenClaw wake-up request failed with status 500.'));
    const app = createServer({ config, now: () => now, onEmailReceived });
    const rawBody = JSON.stringify({ ...payload, event_id: 'evt_failure' });

    const response = await app.inject({
      method: 'POST',
      url: '/agentmail/webhook',
      headers: signedHeaders(rawBody, { 'x-agentmail-delivery': 'evt_failure' }),
      payload: rawBody,
    });

    expect(response.statusCode).toBe(502);
  });
});
