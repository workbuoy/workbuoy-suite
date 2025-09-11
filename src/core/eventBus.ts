type Handler<T> = (payload: T) => void;

export class EventBus {
  private handlers: Map<string, Handler<any>[]> = new Map();

  /**
   * Subscribe to a topic with a handler.
   */
  subscribe<T>(topic: string, handler: Handler<T>): void {
    const arr = this.handlers.get(topic) ?? [];
    arr.push(handler as Handler<any>);
    this.handlers.set(topic, arr);
  }

  /**
   * Publish a payload to all subscribers of a topic.
   */
  publish<T>(topic: string, payload: T): void {
    const arr = this.handlers.get(topic);
    if (arr) {
      arr.forEach((handler) => handler(payload));
    }
  }
}
