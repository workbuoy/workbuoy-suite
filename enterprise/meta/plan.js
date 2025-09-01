import { generateFeatureRoadmap } from '../../../lib/meta/planner.js';
export default async function handler(req,res){
  const data = generateFeatureRoadmap();
  res.json({ ok:true, data });
}