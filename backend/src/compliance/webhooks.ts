type WebhookEvent = {
  ts: number;
  type: string; // privacy.event
  event: string; // privacy.export.started, privacy.export.completed, etc.
  data: any;
};

const queue: WebhookEvent[] = [];

export function emitWebhook(event: string, data: any){
  queue.push({ ts: Date.now(), type: 'privacy.event', event, data });
}

export function getQueue(){ return queue; }
export function clearQueue(){ queue.length = 0; }
