import { useEffect, useMemo, useState } from 'react';
import {
  AutonomousFeatureSummary,
  ConsciousnessSnapshot,
  EvolutionMetricsSummary,
  EvolutionStreamMessage
} from './types.js';

const STREAM_ENDPOINT = '/api/meta-evolution/stream';
const SELF_ANALYSIS_ENDPOINT = '/api/meta-evolution/consciousness/self-analysis';
const AUTONOMOUS_DEVELOP_ENDPOINT = '/api/meta-evolution/genesis/autonomous-develop';

export function EvolutionDashboard() {
  const [consciousness, setConsciousness] = useState<ConsciousnessSnapshot | null>(null);
  const [metrics, setMetrics] = useState<EvolutionMetricsSummary | null>(null);
  const [features, setFeatures] = useState<AutonomousFeatureSummary[]>([]);
  const [isEvolving, setIsEvolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();

    const initialise = async () => {
      try {
        const response = await fetch(SELF_ANALYSIS_ENDPOINT, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load self-analysis: ${response.status}`);
        }
        const payload = (await response.json()) as ConsciousnessSnapshot;
        if (isSubscribed) {
          setConsciousness(payload);
        }
      } catch (caughtError) {
        if (!isSubscribed || (caughtError as Error).name === 'AbortError') {
          return;
        }
        setError((caughtError as Error).message);
      }
    };

    initialise();

    const eventSource = new EventSource(STREAM_ENDPOINT);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as EvolutionStreamMessage;
        if (!isSubscribed) {
          return;
        }
        setMetrics(data.metrics);
        setFeatures(data.features);
      } catch (caughtError) {
        if (!isSubscribed) {
          return;
        }
        setError((caughtError as Error).message);
      }
    };

    eventSource.onerror = () => {
      if (!isSubscribed) {
        return;
      }
      setError('Lost connection to evolution stream. Retrying soon...');
      eventSource.close();
      setTimeout(() => {
        if (isSubscribed) {
          setError(null);
        }
      }, 3000);
    };

    return () => {
      isSubscribed = false;
      controller.abort();
      eventSource.close();
    };
  }, []);

  const lastUpdated = useMemo(() => {
    return consciousness?.timestamp ? new Date(consciousness.timestamp).toLocaleString() : '–';
  }, [consciousness?.timestamp]);

  const triggerEvolution = async () => {
    setIsEvolving(true);
    setError(null);

    try {
      const response = await fetch(AUTONOMOUS_DEVELOP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger evolution: ${response.status}`);
      }

      const payload = await response.json();
      if (payload?.feature) {
        setFeatures((current) => {
          const next = [
            transformFeature(payload.feature),
            ...current.filter((feature) => feature.id !== payload.feature.need?.id)
          ];
          return next.slice(0, 5);
        });
      }
    } catch (caughtError) {
      setError((caughtError as Error).message);
    } finally {
      setIsEvolving(false);
    }
  };

  return (
    <div className="evolution-dashboard">
      <header className="evolution-dashboard__header">
        <h1>META Evolution Engine</h1>
        <p className="evolution-dashboard__meta">Last evaluated: {lastUpdated}</p>
      </header>

      {error && <div className="evolution-dashboard__error">{error}</div>}

      <section className="evolution-dashboard__consciousness">
        <h2>Consciousness Level</h2>
        <div className="evolution-dashboard__awareness">{formatPercentage(consciousness?.awarenessLevel)}</div>
        <div className="evolution-dashboard__metrics">
          <Metric label="Files" value={consciousness?.codeAnalysis.totalFiles ?? 0} />
          <Metric label="Complexity" value={consciousness?.codeAnalysis.complexityScore ?? 0} />
          <Metric label="Evolution Potential" value={formatPercentage((consciousness?.codeAnalysis.evolutionPotential ?? 0) * 100)} />
          <Metric label="Opportunities" value={consciousness?.codeAnalysis.improvementOpportunities.length ?? 0} />
        </div>
        {consciousness && consciousness.capabilities.length > 0 && (
          <div className="evolution-dashboard__capabilities">
            <h3>Capabilities</h3>
            <ul>
              {consciousness.capabilities.map((capability) => (
                <li key={capability.id}>
                  <strong>{capability.name}</strong>
                  <span>{formatPercentage(capability.maturity * 100)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="evolution-dashboard__actions">
        <button
          className="evolution-dashboard__trigger"
          type="button"
          onClick={triggerEvolution}
          disabled={isEvolving}
        >
          {isEvolving ? 'Evolving…' : 'Trigger Evolution'}
        </button>
        {metrics && (
          <div className="evolution-dashboard__metrics-grid">
            <Metric label="Generations" value={metrics.generationsRun} />
            <Metric label="Best Fitness" value={metrics.bestFitnessObserved} />
            <Metric label="Average Fitness" value={metrics.averageFitness} />
            <Metric label="Pending Experiments" value={metrics.pendingExperiments} />
          </div>
        )}
      </section>

      <section className="evolution-dashboard__features">
        <h2>Autonomously Generated Features</h2>
        {features.length === 0 ? (
          <p>No autonomous features generated yet. Trigger evolution to begin discovery.</p>
        ) : (
          <div className="evolution-dashboard__feature-list">
            {features.map((feature) => (
              <article key={feature.id} className="evolution-dashboard__feature-card">
                <header>
                  <h3>{feature.name}</h3>
                  <span className="evolution-dashboard__feature-confidence">
                    Confidence {formatPercentage(feature.confidence)}
                  </span>
                </header>
                <p>{feature.description}</p>
                <footer>
                  <span>Impact {formatPercentage(feature.impactScore)}</span>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface MetricProps {
  label: string;
  value: number | string;
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="evolution-dashboard__metric">
      <span className="evolution-dashboard__metric-label">{label}</span>
      <span className="evolution-dashboard__metric-value">{value}</span>
    </div>
  );
}

function formatPercentage(value: number | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '0%';
  }
  return `${Math.round(value)}%`;
}

function transformFeature(payload: any): AutonomousFeatureSummary {
  const id = payload?.need?.id ?? `feature-${Date.now()}`;
  return {
    id,
    name: payload?.specification?.title ?? 'Untitled Feature',
    description: payload?.need?.description ?? 'No description available.',
    impactScore: payload?.need?.impactPotential ?? 0,
    confidence: payload?.need?.confidence ?? 0
  };
}

export default EvolutionDashboard;
