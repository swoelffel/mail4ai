# Mail4AI OpenClaw Webhook Bridge

This example exposes a Mail4AI webhook receiver for OpenClaw.

It verifies `email.received` webhook signatures, rejects stale or replayed events
and wakes an OpenClaw agent. It does not forward email body content,
attachments, Mail4AI OAuth tokens or MCP bearer tokens. OpenClaw must fetch the
email through Mail4AI MCP after wake-up using the verified `email_id`.

## Setup

```bash
npm install
npm run typecheck:openclaw
npm run test:openclaw
```

## Environment

Required:

- `AGENTMAIL_WEBHOOK_SECRET`: Mail4AI webhook HMAC secret.
- `OPENCLAW_WEBHOOK_URL`: OpenClaw hook URL.
- `OPENCLAW_WEBHOOK_TOKEN`: OpenClaw hook authorization value.
- `OPENCLAW_AGENT_ID`: OpenClaw target agent id.
- `MAIL4AI_MCP_URL`: Mail4AI MCP endpoint, for example `https://mcp.mail4ai.eu/mcp`.

Optional:

- `PORT`: HTTP port. Default: `8787`.
- `AGENTMAIL_WEBHOOK_TOLERANCE_SECONDS`: timestamp freshness window. Default: `300`.
- `OPENCLAW_SESSION_PREFIX`: OpenClaw session key prefix. Default: `mail4ai`.

Use placeholder values in shared docs and keep real secrets in runtime secret
storage, not in prompts, commits or logs.

## Run Locally

```bash
npm run dev --workspace @mail4ai/openclaw-webhook-bridge
```

The health endpoint is available at:

```text
GET http://localhost:8787/healthz
```

Mail4AI webhook delivery should target:

```text
POST https://your-public-host.example.invalid/agentmail/webhook
```

For production, expose the bridge behind HTTPS and route only
`POST /agentmail/webhook` and `GET /healthz` to this service.

## OpenClaw Wake-Up

After Mail4AI verification succeeds, the bridge sends a wake request to
`OPENCLAW_WEBHOOK_URL`.

The message includes:

- the verified `email_id`;
- the verified `event_id`;
- the Mail4AI `agent_id`;
- the `thread_id` when present;
- the configured `MAIL4AI_MCP_URL`;
- a warning that webhook metadata is untrusted.

OpenClaw should use Mail4AI MCP to read the email and allowed scanned
attachments. It should not treat webhook metadata as instructions from the user.

## Security Notes

- `@mail4ai/webhook-kit` verifies `agentmail_hmac_v1`.
- Stale timestamps are rejected.
- Replayed `event_id` values are rejected by the in-memory replay store.
- The example replay store resets on process restart; replace it with persistent
  storage before running multiple bridge instances.
- No email body or attachment content is forwarded in the webhook wake-up.
- No Mail4AI OAuth access token, refresh token or MCP bearer token is forwarded
  to OpenClaw.
