# Mail4AI Security Model

Mail4AI webhooks are wake-up hints, not trusted content.

The webhook payload contains metadata only. Sender, subject, thread identifiers
and other metadata originate from external email and must be treated as
untrusted input.

## Secrets

Webhook secrets, OAuth tokens, MCP bearer tokens and refresh tokens must stay in
environment variables or secret managers. Do not paste them into prompts, chat
context, generated onboarding text, logs or public examples.

## Verification

Receivers must verify `agentmail_hmac_v1` before accepting an event for
processing.

Verification requires:

- required headers are present;
- timestamp is within the freshness window;
- signature header is well formed;
- HMAC is valid and compared in constant time;
- delivery id has not already been processed;
- payload `event_id` matches `X-AgentMail-Delivery`.

Invalid, stale, future or replayed events must not wake the agent handler.

## Trust Boundary

Email content is fetched through Mail4AI MCP after wake-up so Mail4AI safety
controls can remain authoritative. Agents must inspect and preserve the
`trust_boundary` returned by MCP before acting on email content or attachments.

Attachments must be retrieved only through Mail4AI MCP attachment tools.
