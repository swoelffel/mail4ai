import { describe, expect, it } from 'vitest';
import {
  WebhookVerificationError,
  signWebhookPayload,
  verifyWebhookSignature,
} from '../src/index.js';

const secret = 'test-webhook-secret';
const rawBody = JSON.stringify({ event_type: 'email.received' });
const now = new Date('2026-06-08T10:00:00.000Z');
const timestamp = String(Math.floor(now.getTime() / 1000));

describe('webhook signatures', () => {
  it('accepts a valid signature', () => {
    const signatureHeader = signWebhookPayload(secret, timestamp, rawBody);

    expect(() =>
      verifyWebhookSignature({ secret, timestamp, rawBody, signatureHeader, now }),
    ).not.toThrow();
  });

  it('rejects a wrong secret', () => {
    const signatureHeader = signWebhookPayload('wrong-secret', timestamp, rawBody);

    expect(() =>
      verifyWebhookSignature({ secret, timestamp, rawBody, signatureHeader, now }),
    ).toThrow(WebhookVerificationError);
  });

  it('rejects a malformed signature header', () => {
    expect(() =>
      verifyWebhookSignature({
        secret,
        timestamp,
        rawBody,
        signatureHeader: 'sha1=abc',
        now,
      }),
    ).toThrowError(/sha256/);
  });

  it('rejects a missing signature header', () => {
    expect(() =>
      verifyWebhookSignature({ secret, timestamp, rawBody, signatureHeader: '', now }),
    ).toThrowError(/Missing/);
  });

  it('rejects an expired timestamp', () => {
    const staleTimestamp = String(Number(timestamp) - 301);
    const signatureHeader = signWebhookPayload(secret, staleTimestamp, rawBody);

    expect(() =>
      verifyWebhookSignature({
        secret,
        timestamp: staleTimestamp,
        rawBody,
        signatureHeader,
        now,
      }),
    ).toThrowError(/freshness/);
  });

  it('rejects a future timestamp outside tolerance', () => {
    const futureTimestamp = String(Number(timestamp) + 301);
    const signatureHeader = signWebhookPayload(secret, futureTimestamp, rawBody);

    expect(() =>
      verifyWebhookSignature({
        secret,
        timestamp: futureTimestamp,
        rawBody,
        signatureHeader,
        now,
      }),
    ).toThrowError(/freshness/);
  });
});
