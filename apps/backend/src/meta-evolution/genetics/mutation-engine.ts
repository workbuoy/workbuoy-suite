import { CodeVariant, ImprovementGoal, Mutation } from '../types.js';
import { CodeGenome } from './code-genome.js';

export interface MutationOptions {
  intensity?: 'low' | 'medium' | 'high';
}

export class MutationEngine {
  private readonly genome: CodeGenome;

  constructor(genome?: CodeGenome) {
    this.genome = genome ?? new CodeGenome();
  }

  craftVariant(goal: ImprovementGoal, index: number, options: MutationOptions = {}): CodeVariant {
    const variant = this.genome.express(goal, index);
    const intensity = options.intensity ?? this.intensityFromIndex(index);
    const adjustment = this.adjustmentStatement(goal, intensity);
    return {
      ...variant,
      changes: [...variant.changes, adjustment]
    };
  }

  summarise(variant: CodeVariant): Mutation {
    const impact = this.estimateImpact(variant);
    const type: Mutation['type'] = impact > 0.7 ? 'architectural' : impact > 0.45 ? 'refactor' : 'tuning';
    return {
      type,
      description: variant.description,
      diff: variant.changes,
      impactEstimate: Number(impact.toFixed(2))
    };
  }

  estimateImpact(variant: CodeVariant): number {
    const base = variant.changes.reduce((score, change) => score + Math.min(change.length, 120), 0);
    const normalised = Math.min(0.95, base / 480);
    return normalised;
  }

  private adjustmentStatement(goal: ImprovementGoal, intensity: MutationOptions['intensity']): string {
    switch (intensity) {
      case 'high':
        return `Re-architect ${goal.area} components to maximise ${goal.targetMetric}.`;
      case 'low':
        return `Introduce lightweight instrumentation to observe ${goal.targetMetric}.`;
      default:
        return `Refine ${goal.area} patterns to elevate ${goal.targetMetric}.`;
    }
  }

  private intensityFromIndex(index: number): MutationOptions['intensity'] {
    if (index % 3 === 0) {
      return 'high';
    }
    if (index % 3 === 1) {
      return 'medium';
    }
    return 'low';
  }
}
