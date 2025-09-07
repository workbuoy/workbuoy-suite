type Handler<T> = (payload: T) => void;

export class EventBus {
  private handlers: { [topic: string]: Array<Handler<any>> } = {};

  subscribe<T>(topic: string, handler: Handler<T>): void {
    if (!this.handlers[topic]) {
      this.handlers[topic] = [];
    }
    this.handlers[topic].push(handler as Handler<any>);
  }

  publish<T>(topic: string, payload: T): void {
    const handlers = this.handlers[topic] || [];
    handlers.forEach((h) => h(payload));
  }
}
