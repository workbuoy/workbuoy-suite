import { createProbe, ProbeDependencies } from './baseProbe.js';
import { Probe } from './types.js';

export type OutboundProbeDependencies = ProbeDependencies;

export function createOutboundProbe(deps: OutboundProbeDependencies): Probe {
  return createProbe('outbound', deps);
}
