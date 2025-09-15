export interface JobAd { id:string; title:string; body:string; location?:string; industry?:string; }
export interface FeatureCandidate { id:string; label:string; evidence:{jobId:string; phrase:string}[]; score:number; }

const KEYWORDS: Record<string, string[]> = {
  'data_quality_monitoring': ['clean datasets','data quality','data hygiene'],
  'report_generation_automation': ['automated reports','reporting automation'],
  'contract_compliance_monitoring': ['contract compliance','vendor compliance'],
  'churn_prevention': ['reduce churn','renewal','customer health'],
  'model_monitoring': ['model monitoring','drift','bias detection']
};

export function extractFeatureCandidates(ads: JobAd[]): FeatureCandidate[] {
  const map = new Map<string, FeatureCandidate>();
  for (const ad of ads) {
    const text = (ad.title + ' ' + ad.body).toLowerCase();
    for (const [fid, kws] of Object.entries(KEYWORDS)) {
      const hits = kws.filter(k=> text.includes(k));
      if (hits.length) {
        const curr = map.get(fid) || { id: fid, label: fid, evidence: [], score: 0 };
        hits.forEach(h => curr.evidence.push({ jobId: ad.id, phrase: h }));
        curr.score += hits.length;
        map.set(fid, curr);
      }
    }
  }
  return Array.from(map.values()).sort((a,b)=> b.score - a.score);
}
