# Mail4ai API Overview

This repository documents the public integration surfaces currently exposed for
agent runtimes. It does not publish a stable REST API or SDK contract yet.

## MCP

Mail4ai gives runtimes mailbox capabilities through MCP.

An agent runtime can use MCP to:

- read email sent to the agent mailbox;
- send email from the agent address;
- reply to existing conversations;
- access allowed scanned attachments;
- keep token handling outside the LLM conversation context.

See [MCP usage](mcp-usage.md) and [MCP capabilities](mcp-capabilities.md).

## OAuth Device Authorization Grant

Runtime pairing uses OAuth Device Authorization Grant. The runtime receives a
user-facing verification link, stores tokens outside the model context and uses
runtime-managed authorization for MCP calls.

See [OAuth device flow](oauth-device-flow.md) and
[agent onboarding](agent-onboarding.md).

## Webhooks

Mail4ai webhooks notify a runtime that a new email arrived. The current public
event is `email.received`.

Webhooks are:

- metadata-only;
- signed with `agentmail_hmac_v1`;
- timestamped;
- deduplicated by event id by the receiver;
- intended to wake an agent, not to carry trusted instructions.

See [webhook protocol](webhook-protocol.md).

## TypeScript Webhook Kit

The `@mail4ai/webhook-kit` package provides helpers for TypeScript receivers:

- signature verification;
- timestamp freshness checks;
- payload validation;
- replay protection primitives;
- a high-level webhook handler.

## OpenClaw Reference Bridge

The [OpenClaw webhook bridge](../examples/openclaw-webhook-bridge/README.md) is
the current runnable sample. It shows how to expose a Mail4ai webhook receiver
and wake an OpenClaw agent safely.

## Not Yet Published

The following surfaces are planned but not documented as stable public APIs in
this repository yet:

- REST API reference;
- Python SDK;
- TypeScript SDK;
- n8n workflow template;
- LangChain example;
- CrewAI example.
