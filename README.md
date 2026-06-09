# Mail4AI Public Agent Kit

Mail4AI gives agents dedicated mailboxes they can use through MCP to read mail,
send mail, reply to conversations, access allowed attachments and receive
webhook wake-ups.

This repository is the public reference kit for Mail4AI-compatible agent
clients. It contains runtime-neutral skills, public protocol docs, security
guidance, TypeScript helpers for webhook verification and runnable examples for
agent runtimes. It does not contain the private AgentMail platform
implementation.

## For OpenClaw Users

Use the OpenClaw bridge example when you want Mail4AI to wake an OpenClaw agent
after a new email arrives.

- [OpenClaw webhook bridge](examples/openclaw-webhook-bridge/README.md)
- [Webhook protocol](docs/webhook-protocol.md)
- [MCP usage](docs/mcp-usage.md)
- [Security model](docs/security-model.md)

The bridge verifies Mail4AI webhook signatures, rejects stale or replayed
events and wakes OpenClaw with metadata only. OpenClaw must fetch email content
through Mail4AI MCP using the verified `email_id`.

## For Agent Developers

Use the public kit when you want to improve Mail4AI agent skills or create a
webhook bridge for another agent runtime.

- [Generic agent skill](skills/generic/SKILL.md)
- [Webhook verification package](packages/webhook-kit)
- [Agent onboarding](docs/agent-onboarding.md)
- [OAuth device flow](docs/oauth-device-flow.md)
- [MCP capabilities](docs/mcp-capabilities.md)
- [Onboarding snippet requirements](docs/onboarding-snippet-requirements.md)

## What Is Included

- The canonical `agentmail_hmac_v1` webhook protocol.
- A TypeScript helper package for verifying webhook notifications.
- Security guidance for treating mail notifications and content as untrusted
  input.
- MCP usage guidance for fetching email content after wake-up.
- Agent onboarding guidance for Mail4AI OAuth and MCP configuration.
- Runtime-neutral agent skill instructions.
- A runnable OpenClaw webhook bridge example.

## Webhook flow

1. Mail4AI sends `email.received` metadata to your receiver.
2. Your receiver verifies the `agentmail_hmac_v1` signature over the raw body.
3. Your receiver rejects stale, malformed or replayed events.
4. Your runtime wakes the agent.
5. The agent fetches email content through Mail4AI MCP using `email_id`.

The webhook never contains email body content or attachments.

## Agent client flow

1. The runtime consumes a Mail4AI onboarding snippet or structured non-secret
   contract.
2. The runtime performs OAuth Device Authorization Grant.
3. The runtime stores tokens outside the LLM conversation context.
4. The agent uses Mail4AI MCP capabilities granted by scope.
5. The agent treats emails and attachments as untrusted external content.

## Local development

```sh
npm install
npm test
npm run typecheck
```

## Docs

- [OpenClaw webhook bridge](examples/openclaw-webhook-bridge/README.md)
- [Agent onboarding](docs/agent-onboarding.md)
- [OAuth device flow](docs/oauth-device-flow.md)
- [MCP capabilities](docs/mcp-capabilities.md)
- [Onboarding snippet requirements](docs/onboarding-snippet-requirements.md)
- [Generic agent skill](skills/generic/SKILL.md)
- [Webhook protocol](docs/webhook-protocol.md)
- [Security model](docs/security-model.md)
- [MCP usage](docs/mcp-usage.md)
