import { analyzeProject } from './analyzer.js';
let recent=[]; try { /* audit not readable in dev build */ } catch(e){}

export function generateFeatureRoadmap(){
  const a = analyzeProject();
  const recent = [];
  const signalsUsed = recent.filter(e=>String(e.action||'').includes('cxm') || String(e.action||'').includes('focus')).length;

  const items = [];
  if(a.todos>0) items.push({ area:'code_health', title:'Close TODOs', impact:'medium', evidence:`${a.todos} TODOs found` });
  if(a.bigFiles.length>0) items.push({ area:'performance', title:'Split large files', impact:'medium', evidence:`${a.bigFiles.length} files >64KB` });
  if(signalsUsed>10) items.push({ area:'product', title:'Double-down on CXM signals', impact:'high', evidence:`${signalsUsed} signal events in audit` });
  items.push({ area:'ux', title:'Transparency banner v2', impact:'low', evidence:'Roadmap requirement' });
  items.push({ area:'secure', title:'GDPR export endpoint', impact:'high', evidence:'Enterprise ask' });

  return { generatedAt: new Date().toISOString(), stats:a, items };
}