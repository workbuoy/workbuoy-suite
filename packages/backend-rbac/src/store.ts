import { randomUUID } from 'node:crypto';
import type { RoleBinding, Store } from './types.js';

export class MemoryStore implements Store {
  private readonly data = new Map<string, RoleBinding[]>();

  async listBindings(tenant_id: string): Promise<RoleBinding[]> {
    return this.data.get(tenant_id) ?? [];
  }

  async upsert(binding: Omit<RoleBinding, 'id' | 'created_at'> & { id?: string }): Promise<RoleBinding> {
    const id = binding.id ?? randomUUID();
    const next: RoleBinding = {
      id,
      created_at: Date.now(),
      effect: 'allow',
      ...binding,
    };
    const list = [...(this.data.get(next.tenant_id) ?? [])];
    const idx = list.findIndex((item) => item.id === next.id);
    if (idx >= 0) {
      list[idx] = next;
    } else {
      list.push(next);
    }
    this.data.set(next.tenant_id, list);
    return next;
  }

  async delete(id: string, tenant_id: string): Promise<boolean> {
    const list = [...(this.data.get(tenant_id) ?? [])];
    const idx = list.findIndex((item) => item.id === id);
    if (idx < 0) {
      return false;
    }
    list.splice(idx, 1);
    this.data.set(tenant_id, list);
    return true;
  }
}

export function createMemoryStore(seed?: RoleBinding[]): MemoryStore {
  const store = new MemoryStore();
  (seed ?? []).forEach((binding) => {
    void store.upsert(binding);
  });
  return store;
}
