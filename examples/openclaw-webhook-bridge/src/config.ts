export interface BridgeConfig {
  agentMailWebhookSecret: string;
  openClawWebhookUrl: string;
  openClawWebhookToken: string;
  openClawAgentId: string;
  mail4AiMcpUrl: string;
  port: number;
  agentMailWebhookToleranceSeconds: number;
  openClawSessionPrefix: string;
}

type Env = Record<string, string | undefined>;

export function loadConfig(env: Env = process.env): BridgeConfig {
  return {
    agentMailWebhookSecret: required(env, 'AGENTMAIL_WEBHOOK_SECRET'),
    openClawWebhookUrl: requiredUrl(env, 'OPENCLAW_WEBHOOK_URL'),
    openClawWebhookToken: required(env, 'OPENCLAW_WEBHOOK_TOKEN'),
    openClawAgentId: required(env, 'OPENCLAW_AGENT_ID'),
    mail4AiMcpUrl: requiredUrl(env, 'MAIL4AI_MCP_URL'),
    port: integer(env.PORT ?? '8787', 'PORT', 1, 65535),
    agentMailWebhookToleranceSeconds: integer(
      env.AGENTMAIL_WEBHOOK_TOLERANCE_SECONDS ?? '300',
      'AGENTMAIL_WEBHOOK_TOLERANCE_SECONDS',
      1,
      3600,
    ),
    openClawSessionPrefix: env.OPENCLAW_SESSION_PREFIX?.trim() || 'mail4ai',
  };
}

function required(env: Env, name: string): string {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requiredUrl(env: Env, name: string): string {
  const value = required(env, name);
  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`${name} must be a valid URL.`);
  }
}

function integer(value: string, name: string, min: number, max: number): number {
  if (!/^\d+$/.test(value)) {
    throw new Error(`${name} must be an integer between ${min} and ${max}.`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}.`);
  }

  return parsed;
}
