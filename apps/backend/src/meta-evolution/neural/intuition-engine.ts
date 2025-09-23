import { CodeVariant, ImprovementGoal } from '../types.js';
import { ArchitectureInsight, ArchitectureOptimizer } from './architecture-optimizer.js';
import { DecisionNetworks, DecisionNetworkSnapshot } from './decision-networks.js';

export interface IntuitionSummary {
  readinessScore: number;
  decision: DecisionNetworkSnapshot;
  architecture: ArchitectureInsight[];
  narrative: string;
}

export class IntuitionEngine {
  private readonly decisionNetworks = new DecisionNetworks();
  private readonly architectureOptimizer = new ArchitectureOptimizer();

  evaluate(variant: CodeVariant, goal: ImprovementGoal): IntuitionSummary {
    const decision = this.decisionNetworks.evaluate(variant, goal);
    const architectureInsights = this.architectureOptimizer.evaluate(variant);
    const readinessScore = this.computeReadiness(decision.score, architectureInsights);

    return {
      readinessScore,
      decision,
      architecture: this.architectureOptimizer.prioritise(architectureInsights),
      narrative: this.buildNarrative(variant, goal, readinessScore)
    };
  }

  private computeReadiness(decisionScore: number, architecture: ArchitectureInsight[]): number {
    if (architecture.length === 0) {
      return Number(decisionScore.toFixed(2));
    }

    const architectureAverage = architecture.reduce((sum, insight) => sum + insight.score, 0) / architecture.length;
    const readiness = 0.6 * decisionScore + 0.4 * architectureAverage;
    return Number(Math.max(0, Math.min(100, readiness)).toFixed(2));
  }

  private buildNarrative(variant: CodeVariant, goal: ImprovementGoal, readiness: number): string {
    const tone = readiness > 70 ? 'Momentum is strong' : readiness > 45 ? 'Balanced opportunity with manageable risk' : 'Further incubation required';
    return `${tone}. Variant ${variant.id} targets ${goal.area} and is projected to lift ${goal.targetMetric} by ${goal.desiredValue}.`;
  }
}
