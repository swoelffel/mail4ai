# Mail4ai

**Email infrastructure for AI agents.**

Mail4ai gives AI agents their own email inbox so they can communicate with
users, receive files, send updates and collaborate with other agents through
standard email workflows.

## What Is Mail4ai?

Mail4ai is a communication layer for agent runtimes.

It gives each agent a dedicated mailbox available through MCP, plus webhook
notifications that can wake a runtime when new mail arrives. The webhook carries
metadata only. The agent fetches message content and allowed attachments through
Mail4ai MCP after the event is verified.

Mail4ai is not an email assistant or a replacement email client. It is email
infrastructure for agents that need to interact with humans, systems and other
agents through a standard asynchronous channel.

## Why Mail4ai?

AI agents increasingly need to interact with the outside world:

- receive instructions from users;
- exchange documents and attachments;
- send status updates and follow-up questions;
- integrate into existing business workflows;
- support human-in-the-loop validation;
- communicate with other specialized agents.

Email is already trusted, asynchronous, file-friendly and widely adopted.
Mail4ai turns email into a practical communication channel for AI agents.

## What You Can Build

- Document intake agents that receive PDFs, contracts or spreadsheets.
- Support agents that qualify requests and ask for missing information.
- Back-office agents that process invoices, forms and operational files.
- Human-in-the-loop workflows where an agent asks for approval by email.
- Multi-agent workflows where agents exchange work through email inboxes.
- Runtime wake-up flows where a verified webhook starts agent processing.

## How It Works

```text
User / Agent A
      |
      | email + attachments
      v
  Mail4ai Inbox
      |
      | MCP / webhook
      v
AI Agent Runtime
      |
      | reply / forward / attach files
      v
User / Agent B
```

1. A user, system or agent sends email to a Mail4ai inbox.
2. Mail4ai emits a metadata-only `email.received` webhook.
3. The runtime verifies the `agentmail_hmac_v1` signature and rejects stale or
   replayed events.
4. The runtime wakes the agent with the verified `email_id`.
5. The agent fetches email content and allowed attachments through Mail4ai MCP.
6. The agent replies, forwards or triggers workflow state according to runtime
   policy.

## Typical Use Cases

- **Document intake:** receive a message with a PDF, process it and reply with a
  summary or next action.
- **Customer support:** qualify an email request, ask follow-up questions and
  escalate to a human when needed.
- **Back-office automation:** receive invoices, forms, contracts or spreadsheets
  and trigger a business workflow.
- **Human-in-the-loop:** request a validation, clarification or missing file
  before continuing.
- **Agent-to-agent workflows:** route part of a task to another agent mailbox
  and consolidate the result.

See [use cases](docs/use-cases.md) for more detail.

## Quick Start

Use the OpenClaw bridge when you want Mail4ai to wake an OpenClaw agent after a
new email arrives.

Create or configure your agent mailbox from the [Mail4ai app](https://app.mail4ai.eu),
then run the public agent kit locally:

```sh
npm install
npm run test
npm run typecheck
```

Then configure the bridge:

- [OpenClaw webhook bridge](examples/openclaw-webhook-bridge/README.md)
- [Webhook protocol](docs/webhook-protocol.md)
- [MCP usage](docs/mcp-usage.md)
- [Security model](docs/security-model.md)

## Examples

The current public runnable example is:

- [OpenClaw webhook bridge](examples/openclaw-webhook-bridge/README.md)

It verifies Mail4ai webhook signatures, rejects malformed, stale or replayed
events and wakes OpenClaw with metadata only. OpenClaw must fetch email content
through Mail4ai MCP using the verified `email_id`.

## Integrations

Current public integration surfaces:

- MCP for mailbox access;
- OAuth Device Authorization Grant for runtime pairing;
- signed webhooks for wake-up notifications;
- `@mail4ai/webhook-kit` for TypeScript webhook verification;
- a runnable OpenClaw bridge example.

Planned integration examples include n8n, LangChain, CrewAI and custom agent
runtimes. They are listed in the roadmap but are not published as runnable
samples until the public API/SDK surface is stable.

## Roadmap

- [x] Public webhook verification helpers.
- [x] MCP usage documentation.
- [x] OAuth device flow documentation.
- [x] OpenClaw webhook bridge example.
- [ ] Public API reference.
- [ ] Python SDK.
- [ ] TypeScript SDK.
- [ ] Attachment handling examples.
- [ ] n8n workflow example.
- [ ] LangChain example.
- [ ] CrewAI example.
- [ ] Agent-to-agent communication examples.

## Who Is This For?

Mail4ai is for:

- developers building AI agents;
- automation integrators;
- product teams building agentic workflows;
- teams connecting agents to existing business processes;
- developers using MCP, OpenClaw or custom agent runtimes.

## Documentation

- [Use cases](docs/use-cases.md)
- [Architecture](docs/architecture.md)
- [API overview](docs/api-overview.md)
- [Agent onboarding](docs/agent-onboarding.md)
- [OAuth device flow](docs/oauth-device-flow.md)
- [MCP capabilities](docs/mcp-capabilities.md)
- [MCP usage](docs/mcp-usage.md)
- [Webhook protocol](docs/webhook-protocol.md)
- [Security model](docs/security-model.md)
- [Generic agent skill](skills/generic/SKILL.md)

## License

MIT
