import { createHmac, timingSafeEqual } from 'node:crypto';
import { WebhookVerificationError } from './errors.js';

const DEFAULT_TOLERANCE_SECONDS = 300;
const SIGNATURE_PREFIX = 'sha256=';

export interface VerifyWebhookOptions {
  secret: string;
  timestamp: string;
  rawBody: string;
  signatureHeader: string;
  now?: Date;
  toleranceSeconds?: number;
}

export function signWebhookPayload(secret: string, timestamp: string, rawBody: string): string {
  const digest = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`, 'utf8')
    .digest('hex');

  return `${SIGNATURE_PREFIX}${digest}`;
}

export function verifyWebhookSignature(options: VerifyWebhookOptions): void {
  const timestampSeconds = parseTimestamp(options.timestamp);
  const nowSeconds = Math.floor((options.now ?? new Date()).getTime() / 1000);
  const toleranceSeconds = options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;

  if (Math.abs(nowSeconds - timestampSeconds) > toleranceSeconds) {
    throw new WebhookVerificationError('stale_timestamp', 'Webhook timestamp is outside the freshness window.');
  }

  const receivedHex = parseSignatureHeader(options.signatureHeader);
  const expectedHeader = signWebhookPayload(options.secret, options.timestamp, options.rawBody);
  const expectedHex = expectedHeader.slice(SIGNATURE_PREFIX.length);

  const received = Buffer.from(receivedHex, 'hex');
  const expected = Buffer.from(expectedHex, 'hex');

  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    throw new WebhookVerificationError('invalid_signature', 'Webhook signature is invalid.');
  }
}

function parseTimestamp(timestamp: string): number {
  if (!/^\d+$/.test(timestamp)) {
    throw new WebhookVerificationError('invalid_timestamp', 'Webhook timestamp must be Unix seconds.');
  }

  const timestampSeconds = Number(timestamp);
  if (!Number.isSafeInteger(timestampSeconds)) {
    throw new WebhookVerificationError('invalid_timestamp', 'Webhook timestamp is outside the safe integer range.');
  }

  return timestampSeconds;
}

function parseSignatureHeader(signatureHeader: string): string {
  if (!signatureHeader) {
    throw new WebhookVerificationError('missing_header', 'Missing X-AgentMail-Signature header.');
  }

  if (!signatureHeader.startsWith(SIGNATURE_PREFIX)) {
    throw new WebhookVerificationError('malformed_signature', 'Webhook signature must use sha256.');
  }

  const hex = signatureHeader.slice(SIGNATURE_PREFIX.length);
  if (!/^[a-f0-9]{64}$/i.test(hex)) {
    throw new WebhookVerificationError('malformed_signature', 'Webhook signature must be a 64 character hex digest.');
  }

  return hex;
}
