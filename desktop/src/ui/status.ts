// desktop/src/ui/status.ts
import { SyncService } from '../sync/SyncService';

let sync: SyncService|null = null;

export function initSync(passphrase: string) {
  sync = new SyncService(passphrase);
}

export function getStatus() {
  if (!sync) return { online:false, lastSync:null };
  return sync.status();
}

export async function enqueue(entity:string, obj:any) {
  if (!sync) throw new Error('not inited');
  await sync.enqueueOp(entity, obj);
}

export async function triggerSync() {
  if (!sync) throw new Error('not inited');
  await sync.syncNow();
}
