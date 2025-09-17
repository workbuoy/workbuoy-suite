import { createProbe, ProbeDependencies } from './baseProbe';
import { Probe } from './types';

export type DbProbeDependencies = ProbeDependencies;

export function createDbProbe(deps: DbProbeDependencies): Probe {
  return createProbe('db', deps);
}
