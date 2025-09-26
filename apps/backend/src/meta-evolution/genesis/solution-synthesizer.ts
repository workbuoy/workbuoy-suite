import { FeatureApproach, FeatureSpecification, LatentNeed } from '../types.js';
import { assertDefined } from '../../utils/require.js';

export interface SolutionFeasibility {
  approachId: string;
  score: number;
  risk: number;
}

export class SolutionSynthesizer {
  brainstorm(need: LatentNeed): FeatureApproach[] {
    const baseConfidence = need.confidence / 100;
    return [
      {
        id: `${need.id}-assistive-ai`,
        summary: `Introduce assistive intelligence flows for ${need.description}.`,
        feasibility: Number((0.6 + baseConfidence * 0.3).toFixed(2)),
        confidence: Math.round(need.confidence * 0.95)
      },
      {
        id: `${need.id}-workflow-refine`,
        summary: `Refine existing workflows to remove manual operations for ${need.description}.`,
        feasibility: Number((0.5 + baseConfidence * 0.25).toFixed(2)),
        confidence: Math.round(need.confidence * 0.9)
      },
      {
        id: `${need.id}-insight-pack`,
        summary: `Bundle insights and alerts that anticipate ${need.description}.`,
        feasibility: Number((0.55 + baseConfidence * 0.35).toFixed(2)),
        confidence: Math.round(need.confidence * 0.92)
      }
    ];
  }

  evaluateFeasibility(approach: FeatureApproach): SolutionFeasibility {
    const risk = Number((1 - Math.min(0.9, approach.feasibility)).toFixed(2));
    return {
      approachId: approach.id,
      score: Number((approach.feasibility * 100).toFixed(2)),
      risk: Number((risk * 100).toFixed(2))
    };
  }

  selectOptimal(approaches: FeatureApproach[], feasibility: SolutionFeasibility[]): FeatureApproach {
    if (approaches.length === 0) {
      throw new Error('No approaches available for selection.');
    }
    if (feasibility.length === 0) {
      const primaryApproach = assertDefined(approaches[0], 'approaches[0]');
      return primaryApproach;
    }

    const scored = approaches.map((approach) => {
      const score = feasibility.find((item) => item.approachId === approach.id)?.score ?? 0;
      return { approach, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = assertDefined(scored[0], 'scored[0]');
    return top.approach;
  }

  generateSpecification(approach: FeatureApproach, need: LatentNeed): FeatureSpecification {
    return {
      id: `${approach.id}-spec`,
      title: `Address ${need.description}`,
      problem: need.description,
      proposal: approach.summary,
      successCriteria: [
        'Reduce manual touch points by 30%.',
        'Increase positive feedback signals within two sprints.',
        'Ensure auditability and governance compliance.'
      ]
    };
  }

  generateImplementation(spec: FeatureSpecification): string {
    return `// Implementation outline for ${spec.title}\nexport function implement${this.toPascal(spec.id)}() {\n  // Step 1: Validate assumptions with stakeholders\n  // Step 2: Build feature toggles and instrumentation\n  // Step 3: Ship iteratively with guarded rollout\n}`;
  }

  generateTests(spec: FeatureSpecification): string[] {
    return [
      `it('validates ${spec.title} success criteria', () => { /* generated test */ });`,
      "it('ensures governance policies are respected', () => { /* generated test */ });"
    ];
  }

  generateDocumentation(spec: FeatureSpecification): string {
    return `# ${spec.title}\n\n${spec.proposal}\n\n## Success Criteria\n${spec.successCriteria.map((item) => `- ${item}`).join('\n')}`;
  }

  assessPotential(spec: FeatureSpecification): number {
    return Number((0.7 + spec.successCriteria.length * 0.05).toFixed(2));
  }

  private toPascal(value: string): string {
    return value
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
  }
}
