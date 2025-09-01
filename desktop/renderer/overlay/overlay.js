const msgs = document.getElementById('msgs');
const q = document.getElementById('q');
const sendBtn = document.getElementById('send');

function append(role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role === 'user' ? 'me' : 'ai'}`;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

async function ask() {
  const text = (q.value || '').trim();
  if (!text) return;
  append('user', text);
  q.value = '';
  try {
    const res = await window.wbDesktop.aiChat([{ role: 'user', content: text }]);
    append('assistant', res?.answer || '(ingen respons)');
  } catch (e) {
    append('assistant', 'Feil ved AI-kall.');
  }
}

sendBtn.addEventListener('click', ask);
q.addEventListener('keydown', (e) => { if (e.key === 'Enter') ask(); });

// Suggestions tab
const tabChat = document.getElementById('tab-chat');
const tabSuggest = document.getElementById('tab-suggest');
const suggestBox = document.getElementById('suggest');

function showChat(){ document.getElementById('msgs').style.display='block'; suggestBox.style.display='none'; }
function showSuggest(){ document.getElementById('msgs').style.display='none'; suggestBox.style.display='block'; loadSuggestions(); }
tabChat.addEventListener('click', showChat);
tabSuggest.addEventListener('click', showSuggest);

async function loadSuggestions() {
  suggestBox.innerHTML = '';
  const form = document.createElement('div'); form.style.display='flex'; form.style.gap='6px'; form.style.marginBottom='8px';
  const selEntity = document.createElement('select');
  for (const v of ['deal','ticket','task','meeting']) { const o = document.createElement('option'); o.value=v; o.textContent=v; selEntity.appendChild(o); }
  const idInput = document.createElement('input'); idInput.placeholder='Entity ID'; idInput.style.flex='1';
  const selKind = document.createElement('select'); ['next_step','email_draft','summary'].forEach(k=>{ const o=document.createElement('option'); o.value=k; o.textContent=k; selKind.appendChild(o); });
  const btn = document.createElement('button'); btn.textContent='Hent';
  form.appendChild(selEntity); form.appendChild(idInput); form.appendChild(selKind); form.appendChild(btn);
  suggestBox.appendChild(form);
  const list = document.createElement('div'); suggestBox.appendChild(list);
  btn.onclick = async ()=>{
    list.innerHTML='Henter...';
    const res = await window.wbDesktop.aiWorkflow({ entity: selEntity.value, entityId: idInput.value.trim(), kind: selKind.value });
    list.innerHTML='';
    (res.suggestions||[]).forEach(s => {
      const card = document.createElement('div'); card.className='msg ai'; card.textContent = s.text || JSON.stringify(s);
      const copy = document.createElement('button'); copy.textContent='Copy'; copy.onclick=()=>navigator.clipboard.writeText(card.textContent);
      card.appendChild(document.createElement('br')); card.appendChild(copy);
      list.appendChild(card);
    });
    if (!list.children.length) list.textContent = 'Ingen forslag.';
  };
}


// Assistant Mode
const tabAssistant = document.getElementById('tab-assistant');
const assistantBox = document.getElementById('assistant');
let assistantSession = [];

function showAssistant(){ document.getElementById('msgs').style.display='none'; document.getElementById('suggest').style.display='none'; assistantBox.style.display='block'; renderAssistant(); }
tabAssistant.addEventListener('click', showAssistant);

function renderAssistant() {
  assistantBox.innerHTML = '';
  const list = document.createElement('div'); assistantBox.appendChild(list);
  assistantSession.forEach(m => { const div = document.createElement('div'); div.className='msg ' + (m.role==='user'?'me':'ai'); div.textContent = m.content; list.appendChild(div); });
  const form = document.createElement('div'); form.className='inp'; assistantBox.appendChild(form);
  const input = document.createElement('input'); input.placeholder = 'Assistant…';
  const send = document.createElement('button'); send.textContent='Send';
  form.appendChild(input); form.appendChild(send);
  const applyWrap = document.createElement('div'); applyWrap.style.marginTop='8px'; assistantBox.appendChild(applyWrap);

  send.onclick = async () => {
    const t = input.value.trim(); if (!t) return;
    assistantSession.push({ role:'user', content:t });
    renderAssistant();
    try {
      const res = await window.wbDesktop.aiChat(assistantSession.slice(-8));
      const text = res?.answer || '(ingen respons)';
      assistantSession.push({ role:'assistant', content:text });
    } catch { assistantSession.push({ role:'assistant', content:'Feil ved assistant.' }); }
    renderAssistant();
  };

  // Apply to CRM (simple JSON patch)
  const patchForm = document.createElement('div'); patchForm.style.display='flex'; patchForm.style.gap='6px'; patchForm.style.marginTop='6px';
  const selEntity = document.createElement('select'); ['deal','ticket','task','meeting'].forEach(k=>{ const o=document.createElement('option'); o.value=k; o.textContent=k; selEntity.appendChild(o); });
  const idInput = document.createElement('input'); idInput.placeholder='Entity ID';
  const patchInput = document.createElement('input'); patchInput.placeholder='Patch JSON (f.eks {"note":"følg opp"})'; patchInput.style.flex='1';
  const applyBtn = document.createElement('button'); applyBtn.textContent='Apply to CRM';
  patchForm.appendChild(selEntity); patchForm.appendChild(idInput); patchForm.appendChild(patchInput); patchForm.appendChild(applyBtn);
  applyWrap.appendChild(patchForm);
  const preview = document.createElement('div'); preview.className='msg ai'; preview.textContent='Forhåndsvisning: siste assistant-svar brukes ofte som forslag.'; applyWrap.appendChild(preview);
  applyBtn.onclick = async () => {
    let payload = {}; try { payload = JSON.parse(patchInput.value||'{}'); } catch { alert('Ugyldig JSON'); return; }
    const r = await window.wbDesktop.assistantApply({ entity: selEntity.value, entityId: idInput.value.trim(), payload });
    preview.textContent = r.ok ? 'Lagt i kø for sync.' : ('Feil: ' + (r.error||''));
  };

  // Email draft + Calendar quick actions
  const quick = document.createElement('div'); quick.style.marginTop='8px'; assistantBox.appendChild(quick);
  const emailBtn = document.createElement('button'); emailBtn.textContent='Lag e-postutkast'; quick.appendChild(emailBtn);
  emailBtn.onclick = async ()=>{
    const subj = 'Oppfølging'; const body = (assistantSession.slice(-1)[0]?.content)||'Hei, ...';
    const r = await window.wbDesktop.emailDraft({ subject: subj, to: [], body });
    alert(r.ok ? 'Utkast enqueued' : 'Feil: '+(r.error||''));
  };
  const calBtn = document.createElement('button'); calBtn.textContent='Opprett møte'; quick.appendChild(calBtn);
  calBtn.onclick = async ()=>{
    const start = new Date(Date.now()+3600*1000).toISOString(); const end = new Date(Date.now()+7200*1000).toISOString();
    const r = await window.wbDesktop.calendarCreate({ title:'Oppfølging', start, end, attendees:[] });
    alert(r.ok ? 'Møte enqueued' : 'Feil: '+(r.error||''));
  };
}


// Phase G: Guided Workflows tab
(function(){
  try {
    const bar = document.getElementById('tab-chat')?.parentElement;
    if (!bar) return;
    const btn = document.createElement('button'); btn.id='tab-workflows'; btn.textContent='Workflows';
    const iframe = document.createElement('iframe'); iframe.id='wf-frame'; iframe.style.cssText='display:none;flex:1;border:0;width:100%;height:70vh;border-radius:10px;background:#0e1730;';
    bar.parentElement.appendChild(iframe);
    bar.appendChild(btn);
    btn.addEventListener('click', ()=>{
      document.getElementById('msgs').style.display='none';
      document.getElementById('suggest').style.display='none';
      document.getElementById('assistant').style.display='none';
      iframe.style.display='block';
      if (!iframe.src) iframe.src = './assistant/workflows.html';
    });
  } catch {}
})();
