# Mail4AI Onboarding Snippet Requirements

Mail4AI onboarding snippets should help an agent runtime configure a mailbox
safely without embedding secrets in prompt text.

## Expression of Need

Improve the Mail4AI onboarding snippet so it becomes an integration-ready
handoff for agent runtimes.

The snippet must explain that Mail4AI provides a dedicated mailbox available
through MCP, with capabilities to read mail, send mail, reply to conversations,
read clean scanned attachments when allowed and manage webhook wake-ups when
granted.

The snippet must make the runtime/model boundary explicit: the runtime performs
OAuth Device Authorization Grant, stores tokens and sends authorized MCP
requests; the model may receive non-secret configuration and user-facing
verification links only.

The snippet should point agents and runtime implementers to the public Mail4AI
agent kit:

https://github.com/swoelffel/mail4ai

That project is the public reference for the generic Mail4AI skill, MCP usage
guidance, webhook security model, webhook verification helpers and example
integration patterns.

## Required Fields

- dedicated email address;
- MCP endpoint;
- OAuth issuer;
- client id;
- agent id;
- scopes;
- plain-language capabilities;
- OAuth pairing steps;
- security reminder for untrusted emails and attachments;
- project reference link.

## Structured Non-Secret Contract

```json
{
  "mail4ai": {
    "mcp_endpoint": "https://mcp.mail4ai.eu/mcp",
    "oauth_issuer": "https://auth.mail4ai.eu",
    "client_id": "custom-runtime",
    "agent_id": "<agent_id>",
    "email_address": "<agent_email>",
    "scopes": [
      "email.read",
      "email.send",
      "email.reply",
      "attachment.read",
      "webhook.manage"
    ]
  }
}
```

## Required Reference Paragraph

```text
For agent integration guidance, use the public Mail4AI agent kit:
https://github.com/swoelffel/mail4ai

It contains the generic Mail4AI agent skill, MCP usage guidance, webhook
security model, webhook verification helpers and example integration patterns.
Use it to configure your runtime safely and to understand how to read, send,
reply, handle attachments and manage webhook wake-ups through Mail4AI.
```

## Prohibited Content

- access tokens;
- refresh tokens;
- webhook secrets;
- private bearer values;
- instructions asking the owner to paste secrets into chat;
- claims that email content or attachments are trusted.
