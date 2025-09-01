import { readOpportunities, readAccounts } from '../connectors/d365.js';

export async function generateCrmSignals(){
  const [opps, accounts] = await Promise.all([readOpportunities(14), readAccounts()]);
  const out = [];
  opps.forEach(o=>{
    if(o.daysSinceActivity > 14){
      out.push({
        type:'crm:stalled_deal',
        title:`${o.name} står stille (${o.daysSinceActivity} dager)`,
        payload:{ opportunity_id:o.id, account_id:o.accountId, days:o.daysSinceActivity, time_hint:null }
      });
    }
  });
  accounts.forEach(a=>{
    const daysToRenewal = daysUntil(a.renewalDate);
    if(daysToRenewal<=14){
      out.push({
        type:'crm:renewal_attention',
        title:`Fornyelse ${a.name} om ${daysToRenewal} dager`,
        payload:{ account_id:a.id, renewalDate:a.renewalDate, time_hint: daysToRenewal<=7?'week_end':null }
      });
    }
  });
  return out;
}

function daysUntil(dateStr){
  const d = new Date(dateStr); const today = new Date();
  return Math.ceil((d - today)/(24*3600*1000));
}
