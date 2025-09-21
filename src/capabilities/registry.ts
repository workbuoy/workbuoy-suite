import type { CapabilityImpl } from '../core/capabilityRunnerRole';
import { testCaps } from './testCaps';

const registry = new Map<string, CapabilityImpl<any>>();

export function registerCapability(id: string, impl: CapabilityImpl<any>): void {
  registry.set(id, impl);
}

export function registerCapabilities(map: Record<string, CapabilityImpl<any>>): void {
  for (const [id, impl] of Object.entries(map)) {
    registerCapability(id, impl);
  }
}

export function getCapabilityImpl<T = any>(id: string): CapabilityImpl<T> | undefined {
  return registry.get(id) as CapabilityImpl<T> | undefined;
}

export function listRegisteredCapabilities(): string[] {
  return Array.from(registry.keys());
}

// Default registrations for test/demo capabilities
registerCapabilities(testCaps as Record<string, CapabilityImpl<any>>);
