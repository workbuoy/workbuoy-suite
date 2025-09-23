import { CodeVariant } from '../types.js';

export interface ArchitectureInsight {
  dimension: string;
  score: number;
  recommendation: string;
}

export class ArchitectureOptimizer {
  evaluate(variant: CodeVariant): ArchitectureInsight[] {
    return [
      this.observeModularity(variant),
      this.observeObservability(variant),
      this.observeResilience(variant)
    ];
  }

  prioritise(insights: ArchitectureInsight[]): ArchitectureInsight[] {
    return [...insights].sort((a, b) => b.score - a.score);
  }

  private observeModularity(variant: CodeVariant): ArchitectureInsight {
    const score = Math.min(100, variant.changes.length * 12);
    return {
      dimension: 'modularity',
      score: Number(score.toFixed(2)),
      recommendation: score > 60
        ? 'Prepare module boundary RFC to document proposed structure.'
        : 'Identify candidate modules where cohesion can be increased.'
    };
  }

  private observeObservability(variant: CodeVariant): ArchitectureInsight {
    const references = variant.changes.filter((change) => change.toLowerCase().includes('instrument'));
    const score = references.length > 0 ? 80 : 40;
    return {
      dimension: 'observability',
      score,
      recommendation: references.length > 0
        ? 'Pair implementation with telemetry dashboards for rollout.'
        : 'Add instrumentation milestones to the evolution backlog.'
    };
  }

  private observeResilience(variant: CodeVariant): ArchitectureInsight {
    const resilienceKeywords = ['retry', 'graceful', 'fallback'];
    const score = variant.changes.some((change) =>
      resilienceKeywords.some((keyword) => change.toLowerCase().includes(keyword))
    ) ? 75 : 35;

    return {
      dimension: 'resilience',
      score,
      recommendation: score > 60
        ? 'Design chaos experiments to validate resilience improvements.'
        : 'Propose incremental resiliency tactics (timeouts, alerts, fallbacks).'
    };
  }
}
