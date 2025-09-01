import { EventEmitter } from 'events';

export type Status = 'offline'|'online'|'syncing'|'error';
export interface StatusPayload { status: Status; lastSyncAt: number | null; error?: string; }

class StatusBus extends EventEmitter {
  private current: StatusPayload = { status: 'offline', lastSyncAt: null };
  set(p: StatusPayload) { this.current = p; this.emit('change', p); }
  get(): StatusPayload { return this.current; }
}

export const statusBus = new StatusBus();
