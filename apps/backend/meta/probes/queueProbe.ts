import { createProbe, ProbeDependencies } from './baseProbe';
import { Probe } from './types';

export type QueueProbeDependencies = ProbeDependencies;

export function createQueueProbe(deps: QueueProbeDependencies): Probe {
  return createProbe('queue', deps);
}
