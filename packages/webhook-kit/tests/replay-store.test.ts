import { describe, expect, it } from 'vitest';
import { InMemoryReplayStore } from '../src/index.js';

describe('InMemoryReplayStore', () => {
  it('remembers event ids', async () => {
    const store = new InMemoryReplayStore();

    await store.remember('evt_123', 300);

    await expect(store.has('evt_123')).resolves.toBe(true);
  });

  it('expires event ids after ttl', async () => {
    let nowMs = Date.parse('2026-06-08T10:00:00.000Z');
    const store = new InMemoryReplayStore(() => new Date(nowMs));

    await store.remember('evt_123', 300);
    nowMs += 300_001;

    await expect(store.has('evt_123')).resolves.toBe(false);
  });
});
