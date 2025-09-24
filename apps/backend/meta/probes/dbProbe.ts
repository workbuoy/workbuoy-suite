import { createProbe, ProbeDependencies } from './baseProbe.js';
import { Probe } from './types.js';

export type DbProbeDependencies = ProbeDependencies;

export function createDbProbe(deps: DbProbeDependencies): Probe {
  return createProbe('db', deps);
}
