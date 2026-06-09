import Fastify from 'fastify';
import {
  handleAgentMailWebhook,
  InMemoryReplayStore,
  WebhookVerificationError,
  type AgentMailWebhookPayload,
} from '@mail4ai/webhook-kit';
import { loadConfig, type BridgeConfig } from './config.js';
import { sendOpenClawWake } from './openclaw-client.js';

interface CreateServerOptions {
  config: BridgeConfig;
  now?: () => Date;
  onEmailReceived?: (payload: AgentMailWebhookPayload) => Promise<void> | void;
}

export function createServer(options: CreateServerOptions) {
  const app = Fastify({ logger: false });
  const replayStore = new InMemoryReplayStore(options.now);
  const onEmailReceived =
    options.onEmailReceived ?? ((payload) => sendOpenClawWake(options.config, payload));

  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_request, body, done) => {
    done(null, body);
  });

  app.get('/healthz', async () => ({ ok: true }));

  app.post('/agentmail/webhook', async (request, reply) => {
    const rawBody = typeof request.body === 'string' ? request.body : '';

    try {
      await handleAgentMailWebhook({
        secret: options.config.agentMailWebhookSecret,
        rawBody,
        headers: request.headers,
        replayStore,
        now: options.now?.(),
        toleranceSeconds: options.config.agentMailWebhookToleranceSeconds,
        onEmailReceived,
      });

      return reply.code(202).send({ accepted: true });
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        return reply.code(statusForWebhookError(error.code)).send({ error: error.code });
      }

      if (error instanceof Error && error.message.startsWith('OpenClaw wake-up request failed')) {
        return reply.code(502).send({ error: 'openclaw_wake_failed' });
      }

      return reply.code(500).send({ error: 'internal_error' });
    }
  });

  return app;
}

function statusForWebhookError(code: WebhookVerificationError['code']): number {
  switch (code) {
    case 'missing_header':
    case 'malformed_signature':
    case 'invalid_payload':
    case 'event_id_mismatch':
      return 400;
    case 'invalid_signature':
    case 'invalid_timestamp':
    case 'stale_timestamp':
      return 401;
    case 'replayed_event':
      return 409;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig();
  const app = createServer({ config });
  await app.listen({ host: '0.0.0.0', port: config.port });
}
