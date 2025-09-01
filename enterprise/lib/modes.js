import { auditLog } from './audit.js';
import { startTrace } from './tracing.js';
import { fetchIssues } from './connectors/github.js';
import { searchPages } from './connectors/notion.js';
import { findTickets } from './connectors/jira.js';

export const Proactivity = {
  INVISIBLE: 'Invisible',
  CALM: 'Calm',
  PROACTIVE: 'Proactive',
  AMBITIOUS: 'Ambitious',
  KRAKEN: 'Kraken',
  TSUNAMI: 'Tsunami'
};

export function handleMode({mode, input, context, user, req}){
  switch(mode){
    case Proactivity.INVISIBLE:
      auditLog({user_email:user?.email||'', action:'mode_invisible_log', details:{context}});
      return { ok: true };
    case Proactivity.CALM:
      return { suggestions: [`Notert: ${input||''}`] };
    case Proactivity.PROACTIVE:
      return { actions: [{type:'reminder', text:'Jeg kan sette opp påminnelse.'}] };
    case Proactivity.AMBITIOUS:
      return ambitiousDraft({ input, context, user });
    case Proactivity.KRAKEN:
      return krakenOrchestrate({ input, context, user });
    case Proactivity.TSUNAMI:
      return tsunamiOverlay({ input, context, user });
    default:
      return { error: 'unknown_mode' };
  }
}

function ambitiousDraft({ input, context, user }){
  const drafts = [
    { type:'email', title:'Utkast: Oppfølging', content:`Hei!\n\n${input||'Statusoppdatering'}\n\n— WorkBuoy`, score:0.86 },
    { type:'doc', title:'Oppsummering', content:`Bakgrunn: ${context?.topic||'N/A'}\nTiltak: ...`, score:0.79 }
  ];
  auditLog({user_email:user?.email, action:'ambitious_draft', details:{ input, count:drafts.length }});
  return { preview: true, drafts };
}

async function krakenOrchestrate({ input, context, user }){
  const tasks = [];
  const trace = [];
  const started = Date.now();
  // Parallel connector calls
  const p1 = (async()=>{ const r=await fetchIssues({ repo: context?.repo||'workbuoy/core' }); trace.push({connector:'github', items:r.length}); return { provider:'github', data:r }; })();
  const p2 = (async()=>{ const r=await searchPages({ query: input||'workbuoy' }); trace.push({connector:'notion', items:r.length}); return { provider:'notion', data:r }; })();
  const p3 = (async()=>{ const r=await findTickets({ jql: 'project=WB AND status!="Done"' }); trace.push({connector:'jira', items:r.length}); return { provider:'jira', data:r }; })();
  const results = await Promise.all([p1,p2,p3]);
  const merged = { issues: results[0].data, pages: results[1].data, tickets: results[2].data };
  const ms = Date.now()-started;
  auditLog({user_email:user?.email, action:'kraken_aggregate', details:{ ms, sizes:{issues:merged.issues.length,pages:merged.pages.length,tickets:merged.tickets.length} }});
  return { requestId: context?.requestId, orchestrated: true, merged, trace };
}

function tsunamiOverlay({ input, context, user }){
  const plan = [
    { step: 1, action:'simulate_write', target:'crm.note', data:{ body: input || 'Oppdatering' } },
    { step: 2, action:'simulate_write', target:'projects.task', data:{ title: 'Følge opp' } }
  ];
  const approvals = [
    { id:'privacy_sensitive', text:'Krever eksplisitt samtykke.', required:true },
    { id:'write_system_high_risk', text:'Vil du lagre i systemet?', required:true }
  ];
  auditLog({user_email:user?.email, action:'tsunami_plan', details:{ steps: plan.length }});
  return { overlay:true, approvals, plan, writebackReady:false };
}
