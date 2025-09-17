import { AnalysisResult, Capability, Limitation } from '../types.js';

export class CapabilityMapper {
  mapFromAnalysis(analysis: AnalysisResult): Capability[] {
    const timestamp = new Date().toISOString();
    const baseCapabilities: Capability[] = [
      {
        id: 'code-introspection',
        name: 'Code Introspection',
        description: 'Understands structure, scale, and composition of the codebase.',
        maturity: analysis.fileCount > 0 ? Math.min(1, analysis.fileCount / 120) : 0.1,
        focusArea: 'analysis',
        lastEvaluated: timestamp
      },
      {
        id: 'pattern-awareness',
        name: 'Pattern Awareness',
        description: 'Recognises architectural and implementation patterns across the project.',
        maturity: analysis.patterns.length > 0 ? Math.min(1, analysis.patterns.length / 15) : 0.25,
        focusArea: 'architecture',
        lastEvaluated: timestamp
      },
      {
        id: 'improvement-scout',
        name: 'Improvement Scout',
        description: 'Detects refactoring and optimisation opportunities.',
        maturity: analysis.opportunities.length > 0 ? Math.max(0.2, 1 - Math.min(1, analysis.opportunities.length / 20)) : 0.65,
        focusArea: 'quality',
        lastEvaluated: timestamp
      }
    ];

    return baseCapabilities.map((capability) => ({
      ...capability,
      maturity: Number(capability.maturity.toFixed(2))
    }));
  }

  identifyLimitations(capabilities: Capability[], analysis: AnalysisResult): Limitation[] {
    const limitations: Limitation[] = [];

    capabilities
      .filter((capability) => capability.maturity < 0.6)
      .forEach((capability) => {
        limitations.push({
          id: `limitation:${capability.id}`,
          description: `${capability.name} maturity is at ${Math.round(capability.maturity * 100)}%.`,
          severity: capability.maturity < 0.4 ? 'high' : 'medium',
          recommendedAction: this.buildRecommendation(capability)
        });
      });

    if (analysis.opportunities.length > 0) {
      limitations.push({
        id: 'limitation:opportunity-load',
        description: `Identified ${analysis.opportunities.length} improvement opportunities that require triage.`,
        severity: analysis.opportunities.length > 12 ? 'high' : 'medium',
        recommendedAction: 'Cluster and prioritise improvement opportunities for upcoming iterations.'
      });
    }

    return limitations;
  }

  private buildRecommendation(capability: Capability): string {
    switch (capability.focusArea) {
      case 'analysis':
        return 'Increase code sampling coverage and incorporate runtime telemetry to deepen introspection.';
      case 'architecture':
        return 'Catalogue observed architectural patterns and compare them against desired target state.';
      case 'quality':
        return 'Schedule guided refactor sessions to eliminate top-ranked improvement opportunities.';
      default:
        return 'Develop a focused experiment to strengthen this capability in the next evolution cycle.';
    }
  }
}
