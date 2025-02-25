export type EventMap = Record<string, any>;

export class PubSubBase<TEventMap extends EventMap> {
  private subscribers: Map<
    keyof TEventMap,
    Set<(payload: TEventMap[keyof TEventMap]) => void>
  > = new Map();

  subscribe<T extends keyof TEventMap>(
    eventType: T,
    callback: TEventMap[T] extends undefined
      ? () => void // No payload
      : (payload: TEventMap[T]) => void // With payload
  ): void {
    const callbacks = this.subscribers.get(eventType) || new Set();
    callbacks.add(callback as (payload: any) => void);
    this.subscribers.set(eventType, callbacks);
  }

  unsubscribe<T extends keyof TEventMap>(
    eventType: T,
    callback: TEventMap[T] extends undefined
      ? () => void
      : (payload: TEventMap[T]) => void
  ): void {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.delete(callback as (payload: any) => void);
      if (callbacks.size === 0) {
        this.subscribers.delete(eventType);
      }
    }
  }

  publish<T extends keyof TEventMap>(
    type: T,
    ...args: TEventMap[T] extends undefined ? [] : [payload: TEventMap[T]]
  ): void {
    const payload = args.length === 0 ? undefined : args[0];

    // Notify subscribers
    const callbacks = this.subscribers.get(type);
    if (callbacks) {
      for (const callback of callbacks) {
        (callback as (payload: TEventMap[T]) => void)(payload as TEventMap[T]);
      }
    }
  }
}
