export interface EventBase<TType extends string, TPayload = never> {
  type: TType;
  payload: TPayload;
}

export class PubSubBase<T extends EventBase<string, any>> {
  private subscribers: Map<string, Set<(event: T) => void>> = new Map();

  subscribe<TType extends T["type"]>(
    eventType: TType,
    callback: (event: Extract<T, { type: TType }>) => void
  ): void {
    const callbacks = this.subscribers.get(eventType) || new Set();
    callbacks.add(callback as (event: T) => void);
    this.subscribers.set(eventType, callbacks);
  }

  unsubscribe(event: T, callback: () => void): void {
    const callbacks = this.subscribers.get(event.type);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  async publish(event: T): Promise<void> {
    const callbacks = this.subscribers.get(event.type) || new Set();
    for (const callback of callbacks) {
      callback(event);
    }
  }
}
