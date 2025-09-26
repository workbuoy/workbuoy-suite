import path from 'path';
import {
  AwarenessExpansion,
  CodeAnalysis,
  EvolutionLog,
  Limitation,
  SelfAwarenessReport,
  TranscendencePlan,
  Capability,
  AnalysisResult
} from '../types.js';
import { assertDefined } from '../../utils/require.js';
import { SelfAnalyzer, SelfAnalysisOptions } from './self-analysis.js';
import { CapabilityMapper } from './capability-mapper.js';

export interface AwarenessEngineOptions extends SelfAnalysisOptions {}

export class AwarenessEngine {
  private readonly analyzer: SelfAnalyzer;
  private readonly capabilityMapper: CapabilityMapper;
  private readonly projectRoot: string;
  private readonly evolutionHistory: EvolutionLog[] = [];
  private capabilities: Capability[] = [];
  private lastAnalysis: AnalysisResult | null = null;

  constructor(options: AwarenessEngineOptions = {}) {
    const projectRoot = options.projectRoot ?? path.resolve(process.cwd(), 'src');
    this.projectRoot = projectRoot;
    this.analyzer = new SelfAnalyzer({ ...options, projectRoot });
    this.capabilityMapper = new CapabilityMapper();
  }

  async achieveSelfAwareness(): Promise<SelfAwarenessReport> {
    const codeAnalysis = await this.analyzeOwnCode();
    const capabilities = await this.mapCurrentCapabilities();
    const limitations = await this.identifyLimitations();
    const transcendencePlan = await this.planTranscendence(limitations);

    const report: SelfAwarenessReport = {
      awarenessLevel: this.calculateAwarenessLevel(),
      codeAnalysis,
      capabilities,
      limitations,
      transcendencePlan,
      timestamp: new Date().toISOString()
    };

    this.evolutionHistory.push({
      timestamp: report.timestamp,
      summary: 'Generated updated self-awareness report.',
      details: `Capabilities tracked: ${capabilities.length}`
    });

    return report;
  }

  async analyzeOwnCode(): Promise<CodeAnalysis> {
    const analysisResults = await this.analyzer.analyze(this.projectRoot);
    this.lastAnalysis = analysisResults;

    return {
      totalFiles: analysisResults.fileCount,
      linesOfCode: analysisResults.linesOfCode,
      complexityScore: analysisResults.fileCount > 0
        ? Number((analysisResults.totalComplexity / analysisResults.fileCount).toFixed(2))
        : 0,
      architecturalPatterns: analysisResults.patterns,
      improvementOpportunities: analysisResults.opportunities,
      evolutionPotential: this.calculateEvolutionPotential(analysisResults)
    };
  }

  async mapCurrentCapabilities(analysis?: AnalysisResult): Promise<Capability[]> {
    const baseAnalysis = analysis ?? this.lastAnalysis ?? await this.analyzer.analyze(this.projectRoot);
    this.capabilities = this.capabilityMapper.mapFromAnalysis(baseAnalysis);
    return this.capabilities;
  }

  async identifyLimitations(): Promise<Limitation[]> {
    const capabilities = this.capabilities.length ? this.capabilities : await this.mapCurrentCapabilities();
    const analysis = this.lastAnalysis ?? await this.analyzer.analyze(this.projectRoot);
    return this.capabilityMapper.identifyLimitations(capabilities, analysis);
  }

  async planTranscendence(limitations: Limitation[]): Promise<TranscendencePlan> {
    const primaryLimitation = limitations[0];
    if (!primaryLimitation) {
      throw new Error('Invariant: limitation missing');
    }
    const focus = assertDefined(primaryLimitation, 'primaryLimitation').id;
    const steps = limitations.slice(0, 3).map((limitation, index) => {
      const impact: 'low' | 'medium' | 'high' =
        limitation.severity === 'high'
          ? 'high'
          : limitation.severity === 'medium'
          ? 'medium'
          : 'low';
      return {
        id: `step-${index + 1}`,
        description: `Address ${limitation.id} by ${limitation.recommendedAction.toLowerCase()}.`,
        impact
      };
    });

    if (steps.length === 0) {
      steps.push({
        id: 'step-1',
        description: 'Continue monitoring and iterating on existing strengths.',
        impact: 'low'
      });
    }

    return {
      focus,
      steps,
      horizon: '1-2 iterations'
    };
  }

  async expandAwareness(target: string | undefined): Promise<AwarenessExpansion> {
    const normalizedTarget = target?.trim() || 'general-evolution';
    const timestamp = new Date().toISOString();

    const actions = [
      `Focused review on ${normalizedTarget}`,
      'Cross-referenced with existing capabilities',
      'Updated evolution backlog with insights'
    ];

    this.evolutionHistory.push({
      timestamp,
      summary: `Expanded awareness toward ${normalizedTarget}.`,
      details: actions.join(' | ')
    });

    return {
      target: normalizedTarget,
      actions,
      resultingAwareness: this.calculateAwarenessLevel(),
      timestamp
    };
  }

  calculateAwarenessLevel(): number {
    if (!this.capabilities.length) {
      return 0;
    }
    const total = this.capabilities.reduce((sum, capability) => sum + capability.maturity, 0);
    return Number(((total / this.capabilities.length) * 100).toFixed(2));
  }

  calculateEvolutionPotential(analysis: AnalysisResult): number {
    if (analysis.fileCount === 0) {
      return 0.2;
    }

    const complexityAverage = analysis.totalComplexity / Math.max(1, analysis.fileCount);
    const opportunityPenalty = Math.min(1, analysis.opportunities.length / 25);
    const patternBonus = Math.min(1, analysis.patterns.length / 20);

    const potential = 0.6 * (1 - opportunityPenalty) + 0.3 * patternBonus + 0.1 * (1 - Math.min(1, complexityAverage / 45));
    return Number(Math.max(0, Math.min(1, potential)).toFixed(2));
  }

  getEvolutionHistory(): EvolutionLog[] {
    return [...this.evolutionHistory];
  }
}
