// public/js/upgrade/upgrade-prompts.js
export function trackCoreDay5Prompt(){
  const started = localStorage.getItem('wb.trialStartedTs');
  if(!started) return;
  const start = new Date(started).getTime();
  const now = Date.now();
  const day5 = 5*24*60*60*1000;
  const day6 = 6*24*60*60*1000;
  if(now-start > day5 && now-start < day6){
    showPrompt('You've saved hours this week with WorkBuoy','Continue for $9/month');
    fetch('/api/usage-event', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ event:'trial_day_5_prompt', module:'core' }) });
  }
}
function showPrompt(title, cta){
  const el = document.createElement('div');
  el.style.cssText='position:fixed;right:16px;bottom:16px;background:#111827;color:#e9eef5;padding:16px;border-radius:12px;border:1px solid rgba(255,255,255,0.12)';
  el.innerHTML = `<strong>${title}</strong><br/><button id="upgCTA" style="margin-top:8px;padding:8px 10px;border-radius:8px;background:#22c55e;border:0;cursor:pointer">${cta}</button>`;
  document.body.appendChild(el);
  document.getElementById('upgCTA').onclick = ()=>{ window.location.href = '/pricing.html'; };
}