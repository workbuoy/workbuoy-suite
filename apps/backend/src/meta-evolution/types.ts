export interface AnalysisResult {
  fileCount: number;
  linesOfCode: number;
  totalComplexity: number;
  patterns: string[];
  opportunities: string[];
}

export interface CodeAnalysis {
  totalFiles: number;
  linesOfCode: number;
  complexityScore: number;
  architecturalPatterns: string[];
  improvementOpportunities: string[];
  evolutionPotential: number;
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  maturity: number;
  focusArea: string;
  lastEvaluated: string;
}

export interface Limitation {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommendedAction: string;
}

export interface TranscendencePlan {
  focus: string;
  steps: Array<{
    id: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
  }>;
  horizon: string;
}

export interface SelfAwarenessReport {
  awarenessLevel: number;
  codeAnalysis: CodeAnalysis;
  capabilities: Capability[];
  limitations: Limitation[];
  transcendencePlan: TranscendencePlan;
  timestamp: string;
}

export interface AwarenessExpansion {
  target: string;
  actions: string[];
  resultingAwareness: number;
  timestamp: string;
}

export interface EvolutionLog {
  timestamp: string;
  summary: string;
  details?: string;
}

export interface ImprovementGoal {
  area: string;
  targetMetric: string;
  desiredValue: number;
  rationale?: string;
}

export interface CodeVariant {
  id: string;
  description: string;
  hypothesis: string;
  changes: string[];
  fitness?: number;
}

export interface EvolutionSimulation {
  generationNumber: number;
  variants: number;
  survivors: number;
  bestFitness: number;
  improvementAchieved: number;
  nextGeneration: CodeVariant[];
}

export interface Mutation {
  type: 'tuning' | 'refactor' | 'architectural';
  description: string;
  diff: string[];
  impactEstimate: number;
}

export interface LatentNeed {
  id: string;
  description: string;
  urgency: number;
  impactPotential: number;
  solutionComplexity: number;
  discoveredAt: string;
  confidence: number;
}

export interface FeatureApproach {
  id: string;
  summary: string;
  feasibility: number;
  confidence: number;
}

export interface FeatureSpecification {
  id: string;
  title: string;
  problem: string;
  proposal: string;
  successCriteria: string[];
}

export interface FeatureGenesis {
  need: LatentNeed;
  approach: FeatureApproach;
  specification: FeatureSpecification;
  implementation: string;
  tests: string[];
  documentation: string;
  evolutionPotential: number;
}

export interface EvolutionMetrics {
  generationsRun: number;
  bestFitnessObserved: number;
  averageFitness: number;
  pendingExperiments: number;
}
