import { FeatureApproach, FeatureGenesis, FeatureSpecification, LatentNeed } from '../types.js';
import { NeedAnalyzer, BehaviorPattern, FrictionPoint, LatentNeedCandidate } from './need-analyzer.js';
import { SolutionSynthesizer, SolutionFeasibility } from './solution-synthesizer.js';

export class FeatureDiscovery {
  private readonly needAnalyzer = new NeedAnalyzer();
  private readonly solutionSynthesizer = new SolutionSynthesizer();
  private needCounter = 0;
  private readonly recentFeatures: FeatureGenesis[] = [];

  async analyzeUserBehavior(): Promise<BehaviorPattern[]> {
    return this.needAnalyzer.analyzeBehavior();
  }

  async identifyFriction(patterns: BehaviorPattern[]): Promise<FrictionPoint[]> {
    return this.needAnalyzer.identifyFriction(patterns);
  }

  async extractLatentNeeds(points: FrictionPoint[]): Promise<LatentNeedCandidate[]> {
    return this.needAnalyzer.extractNeeds(points);
  }

  generateNeedId(): string {
    this.needCounter += 1;
    return `need-${this.needCounter.toString().padStart(3, '0')}`;
  }

  async discoverLatentNeeds(): Promise<LatentNeed[]> {
    const behaviorPatterns = await this.analyzeUserBehavior();
    const frictionPoints = await this.identifyFriction(behaviorPatterns);
    const latentNeedCandidates = await this.extractLatentNeeds(frictionPoints);

    return latentNeedCandidates.map((candidate) => this.toLatentNeed(candidate));
  }

  async synthesizeFeatureSolution(need: LatentNeed): Promise<FeatureGenesis> {
    const approaches = await this.brainstormSolutions(need);
    const feasibility = await Promise.all(approaches.map((approach) => this.evaluateFeasibility(approach)));
    const optimalApproach = this.selectOptimalApproach(approaches, feasibility);

    const featureSpec = await this.generateFeatureSpec(optimalApproach, need);
    const implementation = await this.generateImplementation(featureSpec);

    const feature: FeatureGenesis = {
      need,
      approach: optimalApproach,
      specification: featureSpec,
      implementation,
      tests: await this.generateTests(featureSpec),
      documentation: await this.generateDocumentation(featureSpec),
      evolutionPotential: this.assessEvolutionPotential(featureSpec)
    };

    this.recordFeature(feature);
    return feature;
  }

  async brainstormSolutions(need: LatentNeed): Promise<FeatureApproach[]> {
    return this.solutionSynthesizer.brainstorm(need);
  }

  async evaluateFeasibility(approach: FeatureApproach): Promise<SolutionFeasibility> {
    return this.solutionSynthesizer.evaluateFeasibility(approach);
  }

  selectOptimalApproach(approaches: FeatureApproach[], feasibility: SolutionFeasibility[]): FeatureApproach {
    return this.solutionSynthesizer.selectOptimal(approaches, feasibility);
  }

  async generateFeatureSpec(approach: FeatureApproach, need: LatentNeed): Promise<FeatureSpecification> {
    return this.solutionSynthesizer.generateSpecification(approach, need);
  }

  async generateImplementation(specification: FeatureSpecification): Promise<string> {
    return this.solutionSynthesizer.generateImplementation(specification);
  }

  async generateTests(specification: FeatureSpecification): Promise<string[]> {
    return this.solutionSynthesizer.generateTests(specification);
  }

  async generateDocumentation(specification: FeatureSpecification): Promise<string> {
    return this.solutionSynthesizer.generateDocumentation(specification);
  }

  assessEvolutionPotential(specification: FeatureSpecification): number {
    return this.solutionSynthesizer.assessPotential(specification);
  }

  getRecentFeatures(): FeatureGenesis[] {
    return [...this.recentFeatures];
  }

  private toLatentNeed(candidate: LatentNeedCandidate): LatentNeed {
    return {
      id: this.generateNeedId(),
      description: candidate.description,
      urgency: Number(candidate.urgency.toFixed(2)),
      impactPotential: Number(candidate.impact.toFixed(2)),
      solutionComplexity: Number(candidate.complexity.toFixed(2)),
      discoveredAt: new Date().toISOString(),
      confidence: Number(candidate.confidence.toFixed(2))
    };
  }

  private recordFeature(feature: FeatureGenesis): void {
    this.recentFeatures.unshift(feature);
    if (this.recentFeatures.length > 5) {
      this.recentFeatures.pop();
    }
  }
}
