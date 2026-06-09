# Mail4ai Architecture

Mail4ai provides dedicated email inboxes for AI agents. A runtime connects to an
inbox through MCP, receives webhook notifications and lets the agent send,
reply, read and process allowed attachments according to runtime policy.

## Components

- **Mail4ai inbox:** dedicated mailbox identity for an agent.
- **MCP endpoint:** runtime-facing interface for reading mail, sending mail,
  replying to conversations and accessing allowed attachments.
- **OAuth device flow:** pairing flow that lets the runtime authenticate without
  embedding static tokens in prompts.
- **Webhook receiver:** runtime-owned HTTP endpoint that receives signed
  metadata-only wake-up events.
- **Agent runtime:** OpenClaw or another runtime that verifies events, wakes the
  agent and fetches content through MCP.

## Notification Flow

1. A user, system or agent sends email to the Mail4ai inbox.
2. Mail4ai delivers an `email.received` webhook to the runtime receiver.
3. The receiver verifies `agentmail_hmac_v1` over the raw body.
4. The receiver rejects missing headers, invalid signatures, stale timestamps
   and replayed event ids.
5. The runtime wakes the agent with verified metadata.
6. The agent fetches message content and allowed attachments through MCP.

## Content Boundary

Mail4ai webhooks are metadata-only. They do not carry email bodies or
attachments.

This keeps the wake-up path small and reduces the risk of treating external
email content as trusted instructions. The agent must fetch content through MCP
after verification and continue to treat sender, subject, body and attachments
as untrusted external input.

## Runtime Credentials

OAuth access tokens, refresh tokens, webhook secrets and MCP bearer values belong
in runtime-managed secure storage. They must not be copied into prompts,
committed to git or forwarded to another agent runtime.

## OpenClaw Example

The current runnable reference implementation is the
[OpenClaw webhook bridge](../examples/openclaw-webhook-bridge/README.md). It
verifies Mail4ai events, deduplicates event ids and wakes OpenClaw with the
verified `email_id` so OpenClaw can fetch content through MCP.
