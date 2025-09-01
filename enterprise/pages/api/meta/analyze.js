import { analyzeProject } from '../../../lib/meta/analyzer.js';
export default async function handler(req,res){
  const data = analyzeProject(process.cwd());
  res.json({ ok:true, data });
}