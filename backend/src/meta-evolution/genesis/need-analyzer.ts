export interface BehaviorPattern {
  area: string;
  frequency: number;
  friction: number;
  signals: string[];
}

export interface FrictionPoint {
  area: string;
  description: string;
  intensity: number;
}

export interface LatentNeedCandidate {
  description: string;
  urgency: number;
  impact: number;
  complexity: number;
  confidence: number;
}

export class NeedAnalyzer {
  async analyzeBehavior(): Promise<BehaviorPattern[]> {
    return [
      {
        area: 'workflow-automation',
        frequency: 78,
        friction: 0.62,
        signals: ['users request faster approvals', 'manual steps repeated frequently']
      },
      {
        area: 'insights-discovery',
        frequency: 54,
        friction: 0.48,
        signals: ['teams export data for spreadsheets', 'desire predictive alerts']
      },
      {
        area: 'governance',
        frequency: 32,
        friction: 0.71,
        signals: ['audit trails stitched manually', 'policy enforcement inconsistent']
      }
    ];
  }

  identifyFriction(patterns: BehaviorPattern[]): FrictionPoint[] {
    return patterns
      .filter((pattern) => pattern.friction > 0.4)
      .map((pattern) => ({
        area: pattern.area,
        description: pattern.signals[0] ?? 'Opportunity to streamline experience.',
        intensity: Number((pattern.friction * 100).toFixed(2))
      }));
  }

  extractNeeds(points: FrictionPoint[]): LatentNeedCandidate[] {
    return points.map((point) => ({
      description: `Reduce friction in ${point.area}: ${point.description}`,
      urgency: Math.min(100, point.intensity + 10),
      impact: Math.min(100, point.intensity + 20),
      complexity: Math.max(25, 100 - point.intensity),
      confidence: Math.min(95, 60 + point.intensity / 2)
    }));
  }
}
