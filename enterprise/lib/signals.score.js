import fs from 'fs';
import path from 'path';
import { timeMultipliers } from './time.windows.js';

function loadWeights(){
  try{
    const p = path.join(process.cwd(),'public','config','cxm.weights.json');
    return JSON.parse(fs.readFileSync(p,'utf-8'));
  }catch(e){ return {roles:{},stakeholders:{},time_windows:{}}; }
}

export function scoreSignal({signal, user, goals}){
  const weights = loadWeights();
  const role = (goals && goals.role) || (user && user.role) || 'Account Manager';
  const roleW = weights.roles[role] || {};
  const map = {
    'analytics:revenue_drop':'churn',
    'analytics:target_gap':'target_gap',
    'analytics:product_mix_shift':'upsell',
    'crm:stalled_deal':'stalled_deals',
    'crm:renewal_attention':'renewals'
  };
  const role_weight = roleW[ map[signal.type] ] || 0.5;

  const kpi_alignment = (goals && goals.kpi_name && signal.type.includes(goals.kpi_name)) ? 0.9 : 0.6;

  let stakeholder_weight = 0.5;
  try{
    const tags = (goals && goals.stakeholder_tags) ? JSON.parse(goals.stakeholder_tags) : [];
    if(tags && Array.isArray(tags)){
      const stW = weights.stakeholders || {};
      stakeholder_weight = Math.max(...tags.map(t=> stW[t]||0.5), 0.5);
    }
  }catch(e){}

  const tm = timeMultipliers();
  let time_urgency = 0.5;
  const hint = signal.payload && signal.payload.time_hint;
  if(hint && tm[hint]){
    time_urgency = Math.min(1, 0.5 * tm[hint]);
  }else{
    time_urgency = Math.max(tm.month_end, tm.quarter_end, tm.week_end) - 0.1;
  }

  const noise_penalty = (signal.payload && signal.payload.noise) || 0.0;

  let score = (0.35*role_weight) + (0.25*kpi_alignment) + (0.20*stakeholder_weight) + (0.15*time_urgency) - (0.15*noise_penalty);
  if(signal.payload && signal.payload.context_match){
    score += Math.min(0.2, Math.max(0.1, signal.payload.context_match));
  }
  return Math.max(0, Math.min(1, score));
}
