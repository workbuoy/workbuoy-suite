import { Router } from 'express';
import { existsSync } from 'fs';
import path from 'path';
import { AwarenessEngine } from '../consciousness/awareness-engine.js';
import { EvolutionSimulator } from '../genetics/evolution-simulator.js';
import { FeatureDiscovery } from '../genesis/feature-discovery.js';
import { ImprovementGoal, LatentNeed } from '../types.js';

export interface EvolutionRouterOptions {
  projectRoot?: string;
}

export function createEvolutionRouter(options: EvolutionRouterOptions = {}): Router {
  const router = Router();
  const projectRoot = resolveProjectRoot(options.projectRoot);
  const awarenessEngine = new AwarenessEngine({ projectRoot });
  const evolutionSimulator = new EvolutionSimulator();
  const featureDiscovery = new FeatureDiscovery();

  router.get('/consciousness/self-analysis', async (_req, res, next) => {
    try {
      const selfAnalysis = await awarenessEngine.achieveSelfAwareness();
      res.json(selfAnalysis);
    } catch (error) {
      next(error);
    }
  });

  router.get('/consciousness/capability-map', async (_req, res, next) => {
    try {
      const capabilities = await awarenessEngine.mapCurrentCapabilities();
      res.json(capabilities);
    } catch (error) {
      next(error);
    }
  });

  router.post('/consciousness/expand-awareness', async (req, res, next) => {
    try {
      const expansion = await awarenessEngine.expandAwareness(parseTarget(req.body?.target));
      res.json(expansion);
    } catch (error) {
      next(error);
    }
  });

  router.post('/genetics/evolve', async (req, res, next) => {
    try {
      const goal = toImprovementGoal(req.body?.goal);
      if (!goal) {
        res.status(400).json({ error: 'invalid_goal', message: 'A valid evolution goal is required.' });
        return;
      }
      const simulation = await evolutionSimulator.simulateCodeEvolution(goal);
      res.json(simulation);
    } catch (error) {
      next(error);
    }
  });

  router.post('/genetics/implement-evolution', async (req, res, next) => {
    try {
      const result = await evolutionSimulator.implementEvolution(req.body?.evolution);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get('/genesis/discover-needs', async (_req, res, next) => {
    try {
      const latentNeeds = await featureDiscovery.discoverLatentNeeds();
      res.json(latentNeeds);
    } catch (error) {
      next(error);
    }
  });

  router.post('/genesis/synthesize-feature', async (req, res, next) => {
    try {
      const rawNeed = req.body?.need;
      if (!isLatentNeed(rawNeed)) {
        res.status(400).json({ error: 'invalid_need', message: 'A valid latent need is required.' });
        return;
      }
      const featureGenesis = await featureDiscovery.synthesizeFeatureSolution(rawNeed);
      res.json(featureGenesis);
    } catch (error) {
      next(error);
    }
  });

  router.post('/genesis/autonomous-develop', async (_req, res, next) => {
    try {
      const needs = await featureDiscovery.discoverLatentNeeds();
      const prioritizedNeed = needs.sort((a, b) => b.impactPotential - a.impactPotential)[0];

      if (!prioritizedNeed) {
        res.json({ message: 'No high-impact needs discovered at this time.' });
        return;
      }

      const feature = await featureDiscovery.synthesizeFeatureSolution(prioritizedNeed);
      const implementation = await evolutionSimulator.implementFeature(feature);
      res.json({ feature, implementation });
    } catch (error) {
      next(error);
    }
  });

  router.get('/stream', (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });

    const sendUpdate = () => {
      const payload = {
        metrics: evolutionSimulator.getMetrics(),
        features: featureDiscovery.getRecentFeatures().map((feature) => ({
          id: feature.need.id,
          name: feature.specification.title,
          description: feature.need.description,
          impactScore: feature.need.impactPotential,
          confidence: feature.need.confidence
        }))
      };
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    sendUpdate();
    const interval = setInterval(sendUpdate, 15000);

    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  });

  return router;
}

function resolveProjectRoot(proposed?: string): string {
  const candidates = [proposed, process.env.META_EVOLUTION_PROJECT_ROOT, path.resolve(process.cwd(), 'src'), path.resolve(process.cwd(), 'backend', 'src')];

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) {
      return path.resolve(candidate);
    }
  }

  return process.cwd();
}

function parseTarget(target: unknown): string | undefined {
  if (typeof target === 'string' && target.trim().length > 0) {
    return target;
  }
  return undefined;
}

function toImprovementGoal(goal: unknown): ImprovementGoal | null {
  if (
    goal &&
    typeof goal === 'object' &&
    typeof (goal as ImprovementGoal).area === 'string' &&
    typeof (goal as ImprovementGoal).targetMetric === 'string' &&
    typeof (goal as ImprovementGoal).desiredValue === 'number'
  ) {
    const typedGoal = goal as ImprovementGoal;
    return {
      area: typedGoal.area,
      targetMetric: typedGoal.targetMetric,
      desiredValue: typedGoal.desiredValue,
      rationale: typeof typedGoal.rationale === 'string' ? typedGoal.rationale : undefined
    };
  }
  return null;
}

function isLatentNeed(value: unknown): value is LatentNeed {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as LatentNeed).id === 'string' &&
    typeof (value as LatentNeed).description === 'string' &&
    typeof (value as LatentNeed).urgency === 'number' &&
    typeof (value as LatentNeed).impactPotential === 'number' &&
    typeof (value as LatentNeed).solutionComplexity === 'number' &&
    typeof (value as LatentNeed).discoveredAt === 'string' &&
    typeof (value as LatentNeed).confidence === 'number'
  );
}

export default createEvolutionRouter;
