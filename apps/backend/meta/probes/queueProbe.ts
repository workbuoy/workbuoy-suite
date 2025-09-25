import { createProbe, ProbeDependencies } from './baseProbe.js';
import { Probe } from './types.js';

export type QueueProbeDependencies = ProbeDependencies;

export function createQueueProbe(deps: QueueProbeDependencies): Probe {
  return createProbe('queue', deps);
}
