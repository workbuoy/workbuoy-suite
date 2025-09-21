import { FeatureRepoV2 } from '../../roles/db/FeatureRepo.v2';
import { aggregateFeatureUseCount } from '../../telemetry/usageSignals.db.v2';

export async function rankActiveFeatures(ctx: { tenant: string; user: string; role: string }){
  const featureRepo = await FeatureRepoV2.open();
  const features = await featureRepo.all();
  const usage = await aggregateFeatureUseCount(ctx.user);
  const umap = new Map<string, number>(usage.map(r => [r.feature_id, r.cnt]));

  const scored = features.map((f:any) => {
    const cap = f.default_autonomy_cap ?? 3;
    const use = umap.get(f.id) || 0;
    const score = cap + Math.min(use, 5) * 0.2;
    return { id: f.id, title: f.title, cap, use, score };
  });

  scored.sort((a,b)=> b.score - a.score);
  return scored;
}
