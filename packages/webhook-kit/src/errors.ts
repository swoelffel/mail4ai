export type WebhookErrorCode =
  | 'missing_header'
  | 'malformed_signature'
  | 'invalid_signature'
  | 'invalid_timestamp'
  | 'stale_timestamp'
  | 'invalid_payload'
  | 'event_id_mismatch'
  | 'replayed_event';

export class WebhookVerificationError extends Error {
  readonly code: WebhookErrorCode;

  constructor(code: WebhookErrorCode, message: string) {
    super(message);
    this.name = 'WebhookVerificationError';
    this.code = code;
  }
}
