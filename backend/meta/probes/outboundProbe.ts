import { createProbe, ProbeDependencies } from './baseProbe';
import { Probe } from './types';

export type OutboundProbeDependencies = ProbeDependencies;

export function createOutboundProbe(deps: OutboundProbeDependencies): Probe {
  return createProbe('outbound', deps);
}
