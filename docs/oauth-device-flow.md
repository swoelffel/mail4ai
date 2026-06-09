# Mail4AI OAuth Device Flow

Mail4AI runtimes authenticate with OAuth Device Authorization Grant. The runtime
performs this flow; the model should not receive runtime secrets.

## Flow

1. The runtime posts to the OAuth issuer device authorization endpoint with the
   public client id, agent id and requested scopes.
2. The runtime receives a device code, user code, verification URI, complete
   verification URI, expiry and polling interval.
3. The runtime displays the complete verification URI to the agent owner.
4. The owner approves access in the Mail4AI console.
5. The runtime polls the token endpoint using the device-code grant type.
6. When approved, the runtime stores the resulting tokens outside the LLM
   conversation context.
7. The runtime sends MCP requests with authorization derived from secure token
   storage.

## Polling Outcomes

- `authorization_pending`: continue polling after the returned interval.
- `slow_down`: increase the polling delay before trying again.
- `expired_token`: stop polling and restart pairing.
- `access_denied`: stop polling and report that the owner denied access.
- success: store tokens and connect to Mail4AI MCP.

## Security Rules

- Do not paste device codes, access tokens or refresh tokens into chat.
- Do not log token responses.
- Do not include tokens in generated docs, examples or issue reports.
- Re-pair or refresh through the runtime when authorization fails.
