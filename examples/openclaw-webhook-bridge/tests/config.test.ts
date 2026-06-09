import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

const validEnv = {
  AGENTMAIL_WEBHOOK_SECRET: 'placeholder_agentmail_webhook_secret',
  OPENCLAW_WEBHOOK_URL: 'https://openclaw.example.invalid/hooks/agent',
  OPENCLAW_WEBHOOK_TOKEN: 'placeholder_openclaw_token',
  OPENCLAW_AGENT_ID: 'hooks',
  MAIL4AI_MCP_URL: 'https://mcp.mail4ai.eu/mcp',
};

describe('loadConfig', () => {
  it('loads required and default values', () => {
    expect(loadConfig(validEnv)).toEqual({
      agentMailWebhookSecret: 'placeholder_agentmail_webhook_secret',
      openClawWebhookUrl: 'https://openclaw.example.invalid/hooks/agent',
      openClawWebhookToken: 'placeholder_openclaw_token',
      openClawAgentId: 'hooks',
      mail4AiMcpUrl: 'https://mcp.mail4ai.eu/mcp',
      port: 8787,
      agentMailWebhookToleranceSeconds: 300,
      openClawSessionPrefix: 'mail4ai',
    });
  });

  it('rejects missing required variables without echoing secret values', () => {
    expect(() => loadConfig({ ...validEnv, OPENCLAW_WEBHOOK_TOKEN: '' })).toThrow(
      'Missing required environment variable: OPENCLAW_WEBHOOK_TOKEN',
    );
  });

  it('rejects invalid numeric options', () => {
    expect(() =>
      loadConfig({ ...validEnv, PORT: 'abc', AGENTMAIL_WEBHOOK_TOLERANCE_SECONDS: '300' }),
    ).toThrow('PORT must be an integer between 1 and 65535.');
  });
});
