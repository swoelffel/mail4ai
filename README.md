# Mail4AI Public Agent Kit

Mail4AI gives agents mailbox events they can verify safely, then read through
Mail4AI MCP tools.

This repository contains the public integration kit for agent runtimes. It does
not contain the private AgentMail platform implementation.

## What is included

- The canonical `agentmail_hmac_v1` webhook protocol.
- A TypeScript helper package for verifying webhook notifications.
- Security guidance for treating mail notifications and content as untrusted
  input.
- MCP usage guidance for fetching email content after wake-up.
- Runtime-neutral agent skill instructions.

## Webhook flow

1. Mail4AI sends `email.received` metadata to your receiver.
2. Your receiver verifies the `agentmail_hmac_v1` signature over the raw body.
3. Your receiver rejects stale, malformed or replayed events.
4. Your runtime wakes the agent.
5. The agent fetches email content through Mail4AI MCP using `email_id`.

The webhook never contains email body content or attachments.

## Local development

```sh
npm install
npm test
npm run typecheck
```

## Docs

- [Webhook protocol](docs/webhook-protocol.md)
- [Security model](docs/security-model.md)
- [MCP usage](docs/mcp-usage.md)
