
(async () => {
  const els = {
    startAtLogin: document.getElementById('startAtLogin'),
    notificationsEnabled: document.getElementById('notificationsEnabled'),
    syncInterval: document.getElementById('syncInterval'),
    portalOrigin: document.getElementById('portalOrigin'),
    appVersion: document.getElementById('appVersion'),
    save: document.getElementById('save'),
    close: document.getElementById('close')
  };

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  // Load
  try {
    const s = await window.wbDesktop.getSettings();
    els.startAtLogin.checked = !!s.startAtLogin;
    els.notificationsEnabled.checked = !!s.notificationsEnabled;
    els.syncInterval.value = clamp(Number(s.syncIntervalSec || 300), 60, 3600);
    els.portalOrigin.textContent = s.portalOrigin || '';
    document.getElementById('crmNotifyDeals').checked = !!s.crmNotifyDeals;
    document.getElementById('crmNotifyTickets').checked = !!s.crmNotifyTickets;
    document.getElementById('crmNotifyMeetings').checked = !!s.crmNotifyMeetings;
    document.getElementById('crmNotifyWb2wb').checked = !!s.crmNotifyWb2wb;
    document.getElementById('syncPageSize').value = Math.max(25, Math.min(500, Number(s.syncPageSize || 100)));
    document.getElementById('preferBearer').checked = !!s.preferBearerToken;
    document.getElementById('externalLinks').value = s.externalLinks || 'system';
    document.getElementById('offlineWriteSyncEnabled').checked = !!s.offlineWriteSyncEnabled;
    document.getElementById('aiWorkflowsEnabled').checked = !!s.aiWorkflowsEnabled;
    document.getElementById('telemetryOptIn').checked = !!s.telemetryOptIn;
    document.getElementById('enableEmailIntegration').checked = !!s.enableEmailIntegration;
    document.getElementById('enableCalendarIntegration').checked = !!s.enableCalendarIntegration;
    els.appVersion.textContent = s.version || '';
  } catch (e) {
    console.error('load settings failed', e);
  }

  els.save.addEventListener('click', async () => {
    const patch = {
      startAtLogin: !!els.startAtLogin.checked,
      notificationsEnabled: !!els.notificationsEnabled.checked,
      syncIntervalSec: clamp(Number(els.syncInterval.value || 300), 60, 3600),
      syncPageSize: clamp(Number(document.getElementById('syncPageSize').value || 100), 25, 500),
      preferBearerToken: !!document.getElementById('preferBearer').checked,
      externalLinks: document.getElementById('externalLinks').value,
      offlineWriteSyncEnabled: !!document.getElementById('offlineWriteSyncEnabled').checked,
      aiWorkflowsEnabled: !!document.getElementById('aiWorkflowsEnabled').checked,
      telemetryOptIn: !!document.getElementById('telemetryOptIn').checked,
      enableEmailIntegration: !!document.getElementById('enableEmailIntegration').checked,
      enableCalendarIntegration: !!document.getElementById('enableCalendarIntegration').checked,
      crmNotifyDeals: !!document.getElementById('crmNotifyDeals').checked,
      crmNotifyTickets: !!document.getElementById('crmNotifyTickets').checked,
      crmNotifyMeetings: !!document.getElementById('crmNotifyMeetings').checked,
      crmNotifyWb2wb: !!document.getElementById('crmNotifyWb2wb').checked
    };
    try {
      await window.wbDesktop.updateSettings(patch);
      window.close();
    } catch (e) {
      console.error('save failed', e);
    }
  });

  els.close.addEventListener('click', () => window.close());
})();


// Phase G: org picker + plugins list
(async function(){
  try {
    const wrap = document.querySelector('.wrap') || document.body;
    // Org picker row
    const orgRow = document.createElement('div'); orgRow.className='row';
    const orgLabel = document.createElement('div'); orgLabel.innerHTML='<label>Org-velger</label><div class="desc">Velg aktiv organisasjon</div>';
    const orgSel = document.createElement('select'); orgSel.id='activeOrg';
    orgRow.appendChild(orgLabel); orgRow.appendChild(orgSel); wrap.appendChild(orgRow);
    const r = await window.wbDesktop.orgList();
    (r.orgs||[]).forEach(o=>{ const opt=document.createElement('option'); opt.value=o.id; opt.textContent=o.name||o.id; if (r.active===o.id) opt.selected=true; orgSel.appendChild(opt); });
    orgSel.onchange = async ()=>{ await window.wbDesktop.orgSwitch({ orgId: orgSel.value }); };

    // Plugins list row
    const plRow = document.createElement('div'); plRow.className='row';
    const plLabel = document.createElement('div'); plLabel.innerHTML='<label>Plugins</label><div class="desc">Enable/disable og health-check</div>';
    const plWrap = document.createElement('div'); plWrap.id='pluginsList';
    plRow.appendChild(plLabel); plRow.appendChild(plWrap); wrap.appendChild(plRow);
    const pr = await window.wbDesktop.pluginsList();
    (pr.plugins||[]).forEach(p=>{
      const row = document.createElement('div'); row.style.display='flex'; row.style.gap='8px'; row.style.alignItems='center';
      const name = document.createElement('div'); name.textContent = `${p.name} (${p.key})`;
      const chk = document.createElement('input'); chk.type='checkbox'; chk.checked = !!p.enabled;
      const btn = document.createElement('button'); btn.textContent='Health-check';
      chk.onchange = async ()=>{ await window.wbDesktop.pluginsToggle({ key:p.key, enabled: !!chk.checked }); };
      btn.onclick = async ()=>{ btn.disabled=true; const res = await window.wbDesktop.pluginsHealth({ key:p.key }); btn.disabled=false; alert(res.ok? (res.status?.details || 'OK') : ('Feil: ' + (res.error||''))); };
      row.appendChild(name); row.appendChild(chk); row.appendChild(btn); plWrap.appendChild(row);
    });
  } catch {}
})();
