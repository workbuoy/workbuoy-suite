import type { AuditEvent, CounterLike, RbacConfiguration, Store } from './types.js';
import { MemoryStore } from './store.js';

interface InternalState {
  enforce: boolean;
  store: Store;
  counters: {
    denied: CounterLike;
    policyChange: CounterLike;
  };
  audit: ((event: AuditEvent) => void | Promise<void>) | null;
}

const noopCounter: CounterLike = { inc: () => {} };

const state: InternalState = {
  enforce: (process.env.RBAC_ENFORCE ?? 'true') === 'true',
  store: new MemoryStore(),
  counters: {
    denied: noopCounter,
    policyChange: noopCounter,
  },
  audit: null,
};

export function configureRbac(config: RbacConfiguration = {}): void {
  if (typeof config.enforce === 'boolean') {
    state.enforce = config.enforce;
  }
  if (config.store) {
    state.store = config.store;
  }
  if (config.counters) {
    state.counters = {
      denied: config.counters.denied ?? state.counters.denied,
      policyChange: config.counters.policyChange ?? state.counters.policyChange,
    };
  }
  if ('audit' in config) {
    state.audit = config.audit ?? null;
  }
}

export function getRbacState(): InternalState {
  return state;
}

export function getStore(): Store {
  return state.store;
}

export function getAudit(): InternalState['audit'] {
  return state.audit;
}

export function getCounters(): InternalState['counters'] {
  return state.counters;
}

export function isEnforced(): boolean {
  return state.enforce;
}

export const storeProxy: Store = {
  listBindings(tenant_id: string) {
    return state.store.listBindings(tenant_id);
  },
  upsert(binding) {
    return state.store.upsert(binding);
  },
  delete(id, tenant_id) {
    return state.store.delete(id, tenant_id);
  },
};
