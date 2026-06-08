export interface ReplayStore {
  has(eventId: string): Promise<boolean>;
  remember(eventId: string, ttlSeconds: number): Promise<void>;
}

export class InMemoryReplayStore implements ReplayStore {
  private readonly expirations = new Map<string, number>();
  private readonly now: () => Date;

  constructor(now: () => Date = () => new Date()) {
    this.now = now;
  }

  async has(eventId: string): Promise<boolean> {
    const expiresAt = this.expirations.get(eventId);
    if (expiresAt === undefined) {
      return false;
    }

    if (expiresAt <= this.now().getTime()) {
      this.expirations.delete(eventId);
      return false;
    }

    return true;
  }

  async remember(eventId: string, ttlSeconds: number): Promise<void> {
    this.expirations.set(eventId, this.now().getTime() + ttlSeconds * 1000);
  }
}
