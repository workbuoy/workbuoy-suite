import { CodeVariant, ImprovementGoal } from '../types.js';

export interface DecisionTrace {
  node: string;
  contribution: number;
}

export interface DecisionNetworkSnapshot {
  score: number;
  trace: DecisionTrace[];
}

export class DecisionNetworks {
  private readonly weights: Map<string, number> = new Map([
    ['risk', 0.35],
    ['impact', 0.4],
    ['effort', 0.25]
  ]);

  evaluate(variant: CodeVariant, goal: ImprovementGoal): DecisionNetworkSnapshot {
    const impact = this.weightedScore(goal.desiredValue, 'impact');
    const risk = this.weightedScore(variant.changes.length * 7, 'risk');
    const effort = this.weightedScore(Math.max(20, variant.hypothesis.length / 5), 'effort');

    const score = impact + risk - effort;
    const normalised = Number(Math.max(0, Math.min(100, score)).toFixed(2));

    return {
      score: normalised,
      trace: [
        { node: 'impact', contribution: Number(impact.toFixed(2)) },
        { node: 'risk', contribution: Number(risk.toFixed(2)) },
        { node: 'effort', contribution: Number((-effort).toFixed(2)) }
      ]
    };
  }

  updateWeight(node: string, adjustment: number): void {
    const current = this.weights.get(node) ?? 0.2;
    const updated = Math.max(0, Math.min(1, current + adjustment));
    this.weights.set(node, Number(updated.toFixed(2)));
  }

  describe(): Array<{ node: string; weight: number }> {
    return Array.from(this.weights.entries()).map(([node, weight]) => ({ node, weight }));
  }

  private weightedScore(value: number, node: string): number {
    const weight = this.weights.get(node) ?? 0.2;
    return weight * value;
  }
}
