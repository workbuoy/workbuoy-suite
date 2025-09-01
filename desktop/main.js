
// ==== HARDENING: FAIL WITHOUT SECRETS IN PROD ====
try {
  const isProd = (process.env.NODE_ENV === 'production');
  if (isProd && !process.env.WB_SECRETS_KEY) {
    const { dialog, app } = require('electron');
    dialog.showErrorBox('WorkBuoy Desktop – konfigurasjonsfeil',
      'WB_SECRETS_KEY mangler. Kontakt administrator og sett hemmelig nøkkel i miljøvariabler.');
    process.exit(1);
  }
} catch {}
// ==== /HARDENING ====


const { z } = require('zod');
const Store = require('electron-store');
const { app, BrowserWindow, Menu, Tray, nativeImage, Notification, shell, ipcMain, dialog, globalShortcut } = require('electron');
const path = require('path');
const os = require('os');
const log = require('./logger').create('main');
require('./crash').init();
const { autoUpdater } = require('electron-updater');
const Store = require('electron-store');
const { startMetricsServer, incSession, incNotification } = require('./metrics');
const bg = require('./background');

const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

const PORTAL_URL = process.env.WB_PORTAL_BASE_URL || 'https://app.workbuoy.com/portal';
const CHECK_INTERVAL_MIN = parseInt(process.env.WB_UPDATE_INTERVAL_MIN || '60', 10);
const METRICS_PORT = parseInt(process.env.WB_METRICS_PORT || '9464', 10);

let mainWindow;
let settingsWindow;

let overlayWindow;

function validateQueueInput({ entity, op, entityId, payload }) {
  const entities = ['deal','ticket','task','meeting'];
  const ops = ['create','update','delete'];
  if (!entities.includes(String(entity||'').toLowerCase())) throw new Error('bad entity');
  if (!ops.includes(String(op||'').toLowerCase())) throw new Error('bad op');
  if ((op === 'update' || op === 'delete') && !entityId) throw new Error('missing entityId');
  const json = payload ? JSON.stringify(payload) : '';
  if (json.length > 100_000) throw new Error('payload too large');
}

function toggleOverlay() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    if (overlayWindow.isVisible()) { overlayWindow.hide(); } else { overlayWindow.show(); overlayWindow.focus(); }
    return;
  }
  const { incAIAssistantSessions } = require('./metrics'); incAIAssistantSessions();
  overlayWindow = new BrowserWindow({
    width: 380, height: 500, resizable: false, minimizable: false, maximizable: false,
    title: 'Mini-Buoy',
    frame: false,
    transparent: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    backgroundColor: '#0b1221',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  overlayWindow.loadFile(path.join(__dirname, 'renderer', 'overlay', 'overlay.html'));
}

let tray;
let pendingDeeplinkURL = null;

const store = new Store({
  name: 'settings',
  schema: {
    enableEmailIntegration: { type: 'boolean', default: false },
    enableCalendarIntegration: { type: 'boolean', default: false },
    offlineWriteSyncEnabled: { type: 'boolean', default: true },
    aiWorkflowsEnabled: { type: 'boolean', default: true },
    telemetryOptIn: { type: 'boolean', default: false },
    crmNotifyDeals: { type: 'boolean', default: true },
    crmNotifyTickets: { type: 'boolean', default: true },
    crmNotifyMeetings: { type: 'boolean', default: true },
    crmNotifyWb2wb: { type: 'boolean', default: true },
    externalLinks: { type: 'string', enum: ['system','in-app'], default: 'system' },
    preferBearerToken: { type: 'boolean', default: false },
    syncPageSize: { type: 'number', default: 100, minimum: 25, maximum: 500 },

    startAtLogin: { type: 'boolean', default: false },
    notificationsEnabled: { type: 'boolean', default: true },
    syncIntervalSec: { type: 'number', default: parseInt(process.env.WB_SYNC_POLL_SEC || '300', 10), minimum: 60, maximum: 3600 }
  }
});

// Metrics
startMetricsServer(METRICS_PORT);

// Single instance / Deep links
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

app.setAsDefaultProtocolClient('workbuoy');

app.on('open-url', (event, urlStr) => {
  event.preventDefault();
  if (mainWindow) handleDeepLink(urlStr);
  else pendingDeeplinkURL = urlStr;
});

app.on('second-instance', (event, argv) => {
  if (isWin) {
    const urlArg = argv.find(a => a.startsWith('workbuoy://'));
    if (urlArg) handleDeepLink(urlArg);
  }
  focusApp();
});

function handleDeepLink(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'workbuoy:') return;
    const dest = new URL(parsed.pathname + parsed.search, PORTAL_URL);
    navigate(dest.toString());
  } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {}
    log.error('Deep link error', e);
  }
}

// Auto-update
function setupAutoUpdate() {
  log.transports.file.level = 'info';
  autoUpdater.logger = log;
  if (process.env.WB_UPDATE_CHANNEL) autoUpdater.channel = process.env.WB_UPDATE_CHANNEL;
  if (process.env.WB_ALLOW_DOWNGRADE === '1') autoUpdater.allowDowngrade = true;

  autoUpdater.on('checking-for-update', () => log.info('[updater] checking'));
  autoUpdater.on('update-available', info => { log.info('[updater] available', info?.version); notify('Oppdatering tilgjengelig', `Versjon ${info?.version} lastes ned…`); });
  autoUpdater.on('update-not-available', () => log.info('[updater] none'));
  autoUpdater.on('error', err => log.error('[updater] error', err));
  autoUpdater.on('update-downloaded', info => {
    const result = dialog.showMessageBoxSync({
      type: 'info',
      buttons: ['Restart nå', 'Senere'],
      defaultId: 0,
      cancelId: 1,
      title: 'Oppdatering klar',
      message: `WorkBuoy Desktop ${info?.version} er klar.`,
      detail: 'Appen må starte på nytt for å fullføre oppdateringen.'
    });
    if (result === 0) autoUpdater.quitAndInstall();
    else notify('Oppdatering klar', 'Start appen på nytt når det passer.');
  });

  setTimeout(() => autoUpdater.checkForUpdatesAndNotify().catch(e => log.error(e)), 5000);
  setInterval(() => autoUpdater.checkForUpdates().catch(e => log.error(e)), Math.max(5, CHECK_INTERVAL_MIN) * 60 * 1000);
}

// Windows
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'WorkBuoy Desktop',
    backgroundColor: '#0b1221',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL(PORTAL_URL);

  mainWindow.webContents.on('did-fail-load', () => {
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'offline.html'));
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const dest = new URL(url);
      const base = new URL(PORTAL_URL);
      if (dest.origin === base.origin) return { action: 'allow' };
    if ((store.get('externalLinks') || 'system') === 'in-app') return { action: 'allow' };
    } catch {}
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      if (isMac) app.hide();
      else mainWindow.hide();
      return false;
    }
  });

  mainWindow.on('minimize', (e) => {
    e.preventDefault();
    mainWindow.hide();
  });

  createTray();
  bg.start({ intervalSec: store.get('syncIntervalSec') });
}

// Settings window
function openSettings() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show(); settingsWindow.focus(); return;
  }
  settingsWindow = new BrowserWindow({
    width: 520, height: 420, resizable: false, minimizable: false, maximizable: false,
    title: 'Innstillinger',
    parent: mainWindow,
    modal: isMac ? false : true,
    backgroundColor: '#0e1730',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  settingsWindow.removeMenu?.();
  settingsWindow.loadFile(path.join(__dirname, 'renderer', 'settings', 'settings.html'));
}

// Tray
function createTray() {
  if (tray) return tray;
  const iconPath = path.join(__dirname, 'build', isMac ? 'iconTemplate.png' : 'icon.png');
  const img = nativeImage.createFromPath(iconPath);
  tray = new Tray(img);
  const menu = Menu.buildFromTemplate([
    { label: 'Åpne WorkBuoy', click: () => focusApp(true) },
    { label: 'Innstillinger', click: () => openSettings() },
    { type: 'separator' },
    { label: 'Sjekk etter oppdateringer…', click: () => autoUpdater.checkForUpdates().catch(e => log.error(e)) },
    { type: 'separator' },
    { label: 'Avslutt', click: () => { app.isQuiting = true; app.quit(); } }
  ]);
  tray.setToolTip('WorkBuoy Desktop');
  tray.setContextMenu(menu);
  tray.on('click', () => focusApp(true));
  return tray;
}

// Helpers
function focusApp(show = false) {
  const win = mainWindow;
  if (!win) return;
  if (win.isMinimized()) win.restore();
  if (!win.isVisible() || show) win.show();
  win.focus();
}

function navigate(urlOrPath) {
  if (!mainWindow) return;
  try {
    const base = new URL(PORTAL_URL);
    const u = /^https?:\/\//.test(urlOrPath) ? new URL(urlOrPath) : new URL(urlOrPath, base.origin);
    mainWindow.loadURL(u.toString());
    focusApp(true);
  } catch {
    mainWindow.loadURL(PORTAL_URL);
  }
}

function notify(title, body) {
  if (store.get('notificationsEnabled') !== false) {
    incNotification();
    new Notification({ title, body }).show();
  }
}

function setLoginStartup(enabled) {
  store.set('startAtLogin', !!enabled);
  if (isMac || isWin) {
    app.setLoginItemSettings({ openAtLogin: !!enabled });
  }
}

// IPC
ipcMain.on('wb:notify', (evt, payload) => {
  if (!payload) return;
  notify(payload.title || 'WorkBuoy', payload.body || '');
});


// AI chat -> Buoy API
ipcMain.handle('wb:ai:chat', async (evt, { messages }) => {
  try {
    const msgs = Array.isArray(messages) ? messages.slice(0, 8) : [];
    const textLen = msgs.map(m => String(m.content||'')).join(' ').length;
    if (textLen > 4000) throw new Error('Message too long');
    const { getAuthContext } = require('./auth-bridge');
    const { fetch } = require('undici');
    const { incAIRequests } = require('./metrics');
    const auth = await getAuthContext({ portalUrl: PORTAL_URL, preferBearer: !!store.get('preferBearerToken', false) });
    const headers = { 'content-type': 'application/json' };
    if (auth.cookieHeader) headers['cookie'] = auth.cookieHeader;
    if (auth.bearer) headers['authorization'] = `Bearer ${auth.bearer}`;
    const url = (process.env.WB_AI_BASE_URL || (PORTAL_URL.replace('/portal','') + '/ai')) + '/chat';
    incAIRequests();
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ messages: msgs }) });
    if (!res.ok) throw new Error('AI HTTP ' + res.status);
    const data = await res.json();
    return { ok: true, answer: data.answer || data.output || '' };
  } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {}
    return { ok: false, error: e.message };
  }
});

// CRM notify bridge (optional external triggers)
ipcMain.handle('wb:crm:notify', async (evt, payload) => {
  const { title, body, kind } = payload || {};
  const allow = !!store.get('crmNotify' + (String(kind||'').charAt(0).toUpperCase() + String(kind||'').slice(1)), true);
  if (!allow) return { ok: false, error: 'disabled' };
  new Notification({ title: title || 'CRM', body: body || '' }).show();
  const { incCRMNotifications } = require('./metrics'); incCRMNotifications();
  return { ok: true };
});


ipcMain.handle('wb:getVersion', async () => app.getVersion());

ipcMain.handle('wb:overlay:toggle', async () => { toggleOverlay(); return { ok: true }; });

// Queue API
ipcMain.handle('wb:queue:create', async (evt, data) => {
  try { validateQueueInput(data||{}); } catch(e) { return { ok:false, error: e.message }; }
  const res = await bg.enqueueWrite(data);
  return { ok: true, id: res.id };
});
ipcMain.handle('wb:queue:list', async (evt, q) => {
  try { const items = await bg.listQueue(q||{}); return { ok:true, items }; } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {} return { ok:false, error:e.message, items:[] }; }
});
ipcMain.handle('wb:queue:retry', async (evt, { id }) => {
  try { await bg.retryQueue(id); const { setPluginsEnabledTotal } = require('./metrics'); setPluginsEnabledTotal(_pluginsEnabledCount(store)); return { ok:true }; } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {} return { ok:false, error:e.message }; }
});
ipcMain.handle('wb:queue:resolveConflict', async (evt, { entity, entityId, resolution }) => {
  try { const r = await bg.resolveConflict({ entity, entityId, resolution }); return { ok: true, result: r }; } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {} return { ok:false, error:e.message }; }
});

// AI workflows
ipcMain.handle('wb:ai:workflow', async (evt, input) => {
  try {
    assertAllow('ai:workflow', 'workflow');
    if (!store.get('aiWorkflowsEnabled', true)) throw new Error('ai workflows disabled');
    const { entity, entityId, kind } = input || {};
    const okEntity = ['deal','ticket','task','meeting'].includes(String(entity||'').toLowerCase());
    const okKind = ['next_step','email_draft','summary'].includes(String(kind||''));
    if (!okEntity || !okKind) throw new Error('bad input');
    const { getAuthContext } = require('./auth-bridge'); const { fetch } = require('undici');
    const { incAIWorkflows } = require('./metrics');
    const auth = await getAuthContext({ portalUrl: PORTAL_URL, preferBearer: !!store.get('preferBearerToken', false) });
    const headers = { 'content-type': 'application/json' };
    if (auth.cookieHeader) headers['cookie'] = auth.cookieHeader;
    if (auth.bearer) headers['authorization'] = `Bearer ${auth.bearer}`;
    const base = process.env.WB_AI_BASE_URL || (PORTAL_URL.replace('/portal','') + '/ai');
    const res = await fetch(`${base}/workflows`, { method: 'POST', headers, body: JSON.stringify({ entity, entityId, kind }) });
    if (!res.ok) throw new Error('AI HTTP ' + res.status);
    incAIWorkflows();
    const data = await res.json();
    return { ok: true, suggestions: data.suggestions || [] };
  } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {} return { ok:false, error: e.message, suggestions: [] }; }
});


// Email draft (queues as qtype='email')
// ZOD wb:email:draft
const wb_email_draft_Schema = z.object({ subject: z.string().min(1), to: z.array(z.string().email()).min(1), cc: z.array(z.string().email()).optional(), bcc: z.array(z.string().email()).optional(), body: z.string().optional() });
ipcMain.handle('wb:email:draft', async (evt, draft) => { try { const parsed = wb_email_draft_Schema.parse(arguments[1]||{});
    assertAllow('email:draft', 'email');
  try {
    if (!store.get('enableEmailIntegration', false)) throw new Error('email integration disabled');
    const { subject, to, cc, bcc, body } = draft || {};
    if (!subject || !to || !Array.isArray(to)) throw new Error('bad draft');
    const res = await bg.enqueueWrite({ entity:'task', op:'create', entityId:null, payload:{ subject, to, cc: cc||[], bcc: bcc||[], body }, qtype:'email' });
    const { incEmailDrafts } = require('./metrics'); incEmailDrafts();
    return { ok: true, id: res.id };
  } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {} try { incInvalidIPC(1); } catch {} return { ok:false, error: 'invalid_ipc' }; }
});

// Calendar create (queues as qtype='calendar')
// ZOD wb:calendar:create
const wb_calendar_create_Schema = z.object({ title: z.string().min(1), start: z.string().min(1), end: z.string().min(1), attendees: z.array(z.string()).optional() });
ipcMain.handle('wb:calendar:create', async (evt, ev) => { try { const parsed = wb_calendar_create_Schema.parse(arguments[1]||{});
    assertAllow('calendar:create', 'calendar');
  try {
    if (!store.get('enableCalendarIntegration', false)) throw new Error('calendar integration disabled');
    const { title, start, end, attendees } = ev || {};
    if (!title || !start || !end) throw new Error('bad event');
    const res = await bg.enqueueWrite({ entity:'task', op:'create', entityId:null, payload:{ title, start, end, attendees: attendees||[] }, qtype:'calendar' });
    const { incCalendarEvents } = require('./metrics'); incCalendarEvents();
    return { ok: true, id: res.id };
  } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {} try { incInvalidIPC(1); } catch {} return { ok:false, error: 'invalid_ipc' }; }
});

// Assistant apply (apply-to-CRM via queue)
ipcMain.handle('wb:assistant:apply', async (evt, patch) => {
  try {
    assertAllow('assistant:apply', 'crm');
    const { entity, entityId, payload } = patch || {};
    const entities = ['deal','ticket','task','meeting'];
    if (!entities.includes(String(entity||'').toLowerCase())) throw new Error('bad entity');
    if (!entityId || typeof payload !== 'object') throw new Error('bad patch');
    const res = await bg.enqueueWrite({ entity, op:'update', entityId, payload, qtype:'crm' });
    return { ok: true, id: res.id };
  } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {} try { incInvalidIPC(1); } catch {} return { ok:false, error: 'invalid_ipc' }; }
});

ipcMain.handle('wb:telemetry:optin', async (evt, { optIn }) => {
  try { store.set('telemetryOptIn', !!optIn); const { setPluginsEnabledTotal } = require('./metrics'); setPluginsEnabledTotal(_pluginsEnabledCount(store)); return { ok:true }; } catch { return { ok:false }; }
});


ipcMain.handle('wb:offline:getList', async (evt, { table, limit }) => { try { const list = await bg.readTop(table, Math.max(1, Math.min(50, Number(limit||10)))); return { ok: true, items: list }; } catch(e){ return { ok:false, items:[] }; } });

// Settings getters/setters with validation
ipcMain.handle('wb:getSettings', async () => ({
  startAtLogin: !!store.get('startAtLogin', false),
  notificationsEnabled: store.get('notificationsEnabled') !== false,
  syncIntervalSec: Number(store.get('syncIntervalSec') || 300),
  syncPageSize: Number(store.get('syncPageSize') || 100),
  crmNotifyDeals: !!store.get('crmNotifyDeals', true),
  crmNotifyTickets: !!store.get('crmNotifyTickets', true),
  crmNotifyMeetings: !!store.get('crmNotifyMeetings', true),
  crmNotifyWb2wb: !!store.get('crmNotifyWb2wb', true),
  preferBearerToken: !!store.get('preferBearerToken', false),
  externalLinks: (store.get('externalLinks') || 'system'),
  portalOrigin: new URL(PORTAL_URL).origin,
  version: app.getVersion()
}));

ipcMain.handle('wb:updateSettings', async (evt, patch) => {
  const next = {};
  if (typeof patch?.startAtLogin === 'boolean') next.startAtLogin = patch.startAtLogin;
  if (typeof patch?.notificationsEnabled === 'boolean') next.notificationsEnabled = patch.notificationsEnabled;
  if (typeof patch?.syncIntervalSec === 'number') {
    const v = Math.max(60, Math.min(3600, Math.floor(patch.syncIntervalSec)));
    next.syncIntervalSec = v;
  }

  // apply
  if ('startAtLogin' in next) setLoginStartup(next.startAtLogin);
  if ('notificationsEnabled' in next) store.set('notificationsEnabled', next.notificationsEnabled);
  if ('syncIntervalSec' in next) { store.set('syncIntervalSec', next.syncIntervalSec); bg.schedule(next.syncIntervalSec); }

  
  if (typeof patch?.syncPageSize === 'number') {
    const ps = Math.max(25, Math.min(500, Math.floor(patch.syncPageSize)));
    store.set('syncPageSize', ps);
    process.env.WB_SYNC_PAGE_SIZE = String(ps);
  }
  if (typeof patch?.preferBearerToken === 'boolean') {
    store.set('preferBearerToken', patch.preferBearerToken);
    process.env.WB_PREFER_BEARER = patch.preferBearerToken ? '1' : '0';
  }

  if (typeof patch?.crmNotifyDeals === 'boolean') store.set('crmNotifyDeals', patch.crmNotifyDeals);
  if (typeof patch?.crmNotifyTickets === 'boolean') store.set('crmNotifyTickets', patch.crmNotifyTickets);
  if (typeof patch?.crmNotifyMeetings === 'boolean') store.set('crmNotifyMeetings', patch.crmNotifyMeetings);
  if (typeof patch?.crmNotifyWb2wb === 'boolean') store.set('crmNotifyWb2wb', patch.crmNotifyWb2wb);
  if (typeof patch?.externalLinks === 'string' && ['system','in-app'].includes(patch.externalLinks)) {
    store.set('externalLinks', patch.externalLinks);
  }

  return {
    ok: true,
    settings: {
      startAtLogin: !!store.get('startAtLogin', false),
      notificationsEnabled: store.get('notificationsEnabled') !== false,
      syncIntervalSec: Number(store.get('syncIntervalSec') || 300)
    }
  };
});

// Offline view IPC
ipcMain.handle('wb:offline:getMessages', async (evt, { limit }) => {
  const lim = Math.max(1, Math.min(50, Number(limit || 10)));
  try {
    const list = await bg.readTopMessages(lim);
    return { ok: true, items: list };
  } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {}
    log.error('offline:getMessages failed', e);
    return { ok: false, items: [] };
  }
});

// Hotkey
function registerHotkeys() {
  const combo = 'CommandOrControl+Shift+W';
  const comboOverlay = 'CommandOrControl+Shift+B';
  try {
    globalShortcut.register(combo, () => focusApp(true));
    globalShortcut.register(comboOverlay, () => toggleOverlay());
    log.info(`[hotkey] registered ${combo}`);
  } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {}
    log.error('hotkey register failed', e);
  }
}

// App lifecycle
app.whenReady().then(() => {
  createMainWindow();
  setupAutoUpdate();
  registerHotkeys();
  if (pendingDeeplinkURL) {
    handleDeepLink(pendingDeeplinkURL);
    pendingDeeplinkURL = null;
  }
  if (process.env.NODE_ENV !== 'production') {
    notify('WorkBuoy Desktop', 'Kjører i utviklingsmodus.');
  }
  log.info(`[WorkBuoy Desktop] ${app.getVersion()} on ${os.platform()} ${os.arch()} - Portal: ${PORTAL_URL} - Metrics: http://127.0.0.1:${process.env.WB_METRICS_PORT || 9464}/metrics`);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});


// ===== Phase G IPC & Settings (appended) =====
const { incInvalidIPC } = require('./metrics');
const { registry: _pluginsRegistry, list: _pluginsList, enabledCount: _pluginsEnabledCount, enable: _pluginsEnable } = require('./integrations');

function _activeOrgId() { try { return store.get('activeOrgId','') || ''; } catch { return ''; } }

// Override email/calendar to include orgId and use enqueueWriteEx if available
if (ipcMain && ipcMain.removeHandler) {
  try { ipcMain.removeHandler('wb:email:draft'); } catch {}
  try { ipcMain.removeHandler('wb:calendar:create'); } catch {}
}
// ZOD wb:email:draft
const wb_email_draft_Schema = z.object({ subject: z.string().min(1), to: z.array(z.string().email()).min(1), cc: z.array(z.string().email()).optional(), bcc: z.array(z.string().email()).optional(), body: z.string().optional() });
ipcMain.handle('wb:email:draft', async (evt, draft) => {
  try {
    if (!store.get('enableEmailIntegration', false)) throw new Error('email integration disabled');
    const { subject, to, cc, bcc, body } = draft || {};
    if (!subject || !Array.isArray(to)) throw new Error('bad draft');
    const fn = bg.enqueueWriteEx || bg.enqueueWrite;
    const res = await fn({ entity:'task', op:'create', entityId:null, payload:{ subject, to, cc: cc||[], bcc: bcc||[], body }, qtype:'email', orgId: _activeOrgId() });
    const { incEmailDrafts, setPluginsEnabledTotal } = require('./metrics'); incEmailDrafts(); setPluginsEnabledTotal(_pluginsEnabledCount(store));
    return { ok: true, id: res.id };
  } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {} try { incInvalidIPC(1); } catch {} return { ok:false, error: 'invalid_ipc' }; }
});
// ZOD wb:calendar:create
const wb_calendar_create_Schema = z.object({ title: z.string().min(1), start: z.string().min(1), end: z.string().min(1), attendees: z.array(z.string()).optional() });
ipcMain.handle('wb:calendar:create', async (evt, ev) => {
  try {
    if (!store.get('enableCalendarIntegration', false)) throw new Error('calendar integration disabled');
    const { title, start, end, attendees } = ev || {};
    if (!title || !start || !end) throw new Error('bad event');
    const fn = bg.enqueueWriteEx || bg.enqueueWrite;
    const res = await fn({ entity:'task', op:'create', entityId:null, payload:{ title, start, end, attendees: attendees||[] }, qtype:'calendar', orgId: _activeOrgId() });
    const { incCalendarEvents, setPluginsEnabledTotal } = require('./metrics'); incCalendarEvents(); setPluginsEnabledTotal(_pluginsEnabledCount(store));
    return { ok: true, id: res.id };
  } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {} try { incInvalidIPC(1); } catch {} return { ok:false, error: 'invalid_ipc' }; }
});

// Workflow run
// ZOD wb:workflow:run
const wb_workflow_run_Schema = z.object({ orgId: z.string().min(1), steps: z.array(z.object({ qtype: z.enum(['crm','email','calendar']), entity: z.string().optional(), op: z.string().optional(), entityId: z.string().optional(), payload: z.any().optional() })).min(1) });
ipcMain.handle('wb:workflow:run', async (_evt, wf) => { try { const parsed = wb_workflow_run_Schema.parse(arguments[1]||{});
    assertAllow('workflow:run', 'workflow');
  try {
    if (!wf || typeof wf !== 'object' || !Array.isArray(wf.steps) || !wf.orgId) throw new Error('bad wf');
    const { incAIWorkflows } = require('./metrics'); incAIWorkflows();
    const wfId = String(Date.now()) + '-' + Math.random().toString(36).slice(2);
    if (!bg.enqueueWorkflow) throw new Error('bg no workflow');
    await bg.enqueueWorkflow(wf, wfId);
    return { ok: true, wfId };
  } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {} return { ok:false, error:e.message }; }
});

// Orgs
ipcMain.handle('wb:org:list', async ()=>{
  const orgs = store.get('orgs', []); const active = store.get('activeOrgId','') || (orgs[0]?.id||'');
  const { setOrgsTotal } = require('./metrics'); setOrgsTotal(orgs.length||0);
  if (!store.get('activeOrgId') && active) store.set('activeOrgId', active);
  return { ok:true, orgs, active };
});
// ZOD wb:org:switch
const wb_org_switch_Schema = z.object({ orgId: z.string().min(1) });
ipcMain.handle('wb:org:switch', async (_evt, { orgId }) => { try { const parsed = wb_org_switch_Schema.parse(arguments[1]||{});
  try { if (!orgId || typeof orgId !== 'string') throw new Error('bad orgId');
    store.set('activeOrgId', orgId); const { incOrgSwitches } = require('./metrics'); incOrgSwitches(); const { setPluginsEnabledTotal } = require('./metrics'); setPluginsEnabledTotal(_pluginsEnabledCount(store)); return { ok:true }; } catch(e){ return { ok:false, error:e.message }; }
});

// Plugins
ipcMain.handle('wb:plugins:list', async ()=>{
  const items = _pluginsList(store); const { setPluginsEnabledTotal } = require('./metrics'); setPluginsEnabledTotal(items.filter(p=>p.enabled).length);
  return { ok:true, plugins: items };
});
// ZOD wb:plugins:toggle
const wb_plugins_toggle_Schema = z.object({ key: z.string().min(2), enabled: z.boolean() });
ipcMain.handle('wb:plugins:toggle', async (_evt, { key, enabled }) => { try { const parsed = wb_plugins_toggle_Schema.parse(arguments[1]||{});
    assertAllow('plugin:enable', parsed.key);
  try { const a = _pluginsRegistry[key]; if (!a) throw new Error('unknown plugin'); a.enable(store, !!enabled);
    const { setPluginsEnabledTotal } = require('./metrics'); setPluginsEnabledTotal(_pluginsEnabledCount(store)); const { setPluginsEnabledTotal } = require('./metrics'); setPluginsEnabledTotal(_pluginsEnabledCount(store)); return { ok:true }; } catch(e){ return { ok:false, error:e.message }; }
});
// ZOD wb:plugins:health
const wb_plugins_health_Schema = z.object({ key: z.string().min(2) });
ipcMain.handle('wb:plugins:health', async (_evt, { key }) => { try { const parsed = wb_plugins_health_Schema.parse(arguments[1]||{});
  try { const a = _pluginsRegistry[key]; if (!a) throw new Error('unknown plugin');
    const { getAuthContext } = require('./auth-bridge'); const authCtx = await getAuthContext({ portalUrl: PORTAL_URL, preferBearer: !!store.get('preferBearerToken', false) });
    const r = await a.health({ authCtx }); if (!r.ok) { const { incPluginHealthFailures } = require('./metrics'); incPluginHealthFailures(); }
    return { ok:true, status: r };
  } catch(e){ return { ok:false, error:e.message }; }
});

// ===== End Phase G IPC =====


// ===== Final Ready: OIDC & RBAC (skeleton integration) =====
async function syncRBAC(authCtx) {
  try {
    const { fetch } = require('undici');
    const base = PORTAL_URL.replace('/portal','') + '/rbac';
    const res = await fetch(`${base}/me`, { headers: authCtx?.headers||{} });
    if (!res.ok) return null;
    const data = await res.json();
    store.set('rbac', data);
    return data;
  } catch { return null; }
}
// Gate checks (renderer can ask via wb:getSettings; we never expose secrets)
function hasRole(role) { try { const r = store.get('rbac'); return Array.isArray(r?.roles) && r.roles.includes(role); } catch { return false; }}

// Plugin Gallery window (Next.js UI or local HTML could host this in future)
let pluginGalleryWindow = null;
function openPluginGallery() {
  if (pluginGalleryWindow) { pluginGalleryWindow.focus(); return; }
  pluginGalleryWindow = new BrowserWindow({
    width: 900, height: 640, show: true, webPreferences: { contextIsolation:true, preload: PRELOAD_PATH, sandbox: true }
  });
  pluginGalleryWindow.loadFile(path.join(__dirname, 'renderer', 'plugins', 'gallery.html'));
  pluginGalleryWindow.on('closed', ()=> pluginGalleryWindow = null);
}



// RBAC enforcement helper
function assertAllow(action, resource) {
  try {
    const store = new Store();
    const pol = store.get('rbac') || {};
    const allowed = Array.isArray(pol.allowed) && pol.allowed.includes(`${action}:${resource}`);
    if (!allowed) {
      try { require('./metrics').incInvalidIPC(1); } catch {}
      const err = new Error('rbac_denied');
      err.code = 'RBAC_DENIED';
      throw err;
    }
  } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {}
    if (e.code === 'RBAC_DENIED') throw e;
    const err = new Error('rbac_unavailable');
    err.code = 'RBAC_UNAVAILABLE';
    throw err;
  }
}

// ===== RBAC gating IPC =====
const wb_rbac_can_Schema = z.object({ action: z.string().min(1), resource: z.string().min(1) });
ipcMain.handle('wb:rbac:can', async (_evt, payload) => { try { const { action, resource } = wb_rbac_can_Schema.parse(payload||{});
  try {
    const pol = store.get('rbac') || {};
    // Simple policy: action:resource strings in pol.allowed[] or role-based rules
    const allowed = Array.isArray(pol.allowed) && pol.allowed.includes(`${action}:${resource}`);
    return { ok:true, allow: !!allowed };
  } catch (e) { try { require('./metrics').incInvalidIPC(1);} catch {}
    return { ok:false, allow:false, error:'rbac_error' };
  }
});

// Metrics snapshot IPC
ipcMain.handle('wb:metrics:snapshot', async ()=>{
  try {
    const register = require('prom-client').register;
    return { ok:true, text: await register.metrics() };
  } catch(e) { return { ok:false, error: e.message }; }
});
// Open Dash window via menu or tray later (left as hook)

// Plugin signature verify IPC
ipcMain.handle('wb:plugins:verify', async (_evt, { key })=>{
  try {
    const { verifyAdapter } = require('./integrations/index');
    if (!key || typeof key !== 'string') throw new Error('invalid_key');
    const r = await verifyAdapter(key);
    return r;
  } catch(e) { try { require('./metrics').incInvalidIPC(1);} catch{} return { ok:false, error:e.message }; }
});

const { BrowserWindow, Menu } = require('electron');
let dashWin = null;
function openDashWindow(){
  if (dashWin && !dashWin.isDestroyed()){ dashWin.show(); return; }
  dashWin = new BrowserWindow({ width: 880, height: 640, webPreferences: { contextIsolation:true, nodeIntegration:false, sandbox:true, preload: __dirname + '/preload.js' } });
  dashWin.loadFile(__dirname + '/renderer/dash/index.html');
}
app.whenReady().then(()=>{
  try {
    const menu = Menu.getApplicationMenu();
    const tpl = menu ? menu.items.map(mi=> mi) : [];
    const extra = new Menu();
    extra.append(new (require('electron').MenuItem)({ label:'Dashboards', click: ()=> openDashWindow() }));
    Menu.setApplicationMenu(Menu.buildFromTemplate([...(menu?menu.items:[]), { label:'Tools', submenu:[{ label:'Dashboards', click: ()=> openDashWindow() }]} ]));
  } catch {}
});
