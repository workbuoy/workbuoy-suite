export interface CodeAnalysisSummary {
  totalFiles: number;
  linesOfCode: number;
  complexityScore: number;
  architecturalPatterns: string[];
  improvementOpportunities: string[];
  evolutionPotential: number;
}

export interface CapabilitySummary {
  id: string;
  name: string;
  description: string;
  maturity: number;
  focusArea: string;
  lastEvaluated: string;
}

export interface LimitationSummary {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendedAction: string;
}

export interface TranscendenceStep {
  id: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface TranscendencePlanSummary {
  focus: string;
  steps: TranscendenceStep[];
  horizon: string;
}

export interface ConsciousnessSnapshot {
  awarenessLevel: number;
  codeAnalysis: CodeAnalysisSummary;
  capabilities: CapabilitySummary[];
  limitations: LimitationSummary[];
  transcendencePlan: TranscendencePlanSummary;
  timestamp: string;
}

export interface EvolutionMetricsSummary {
  generationsRun: number;
  bestFitnessObserved: number;
  averageFitness: number;
  pendingExperiments: number;
}

export interface AutonomousFeatureSummary {
  id: string;
  name: string;
  description: string;
  impactScore: number;
  confidence: number;
}

export interface EvolutionStreamMessage {
  metrics: EvolutionMetricsSummary;
  features: AutonomousFeatureSummary[];
}
