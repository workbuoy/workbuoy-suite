
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wbDesktop', { pluginsVerify: (p)=> ipcRenderer.invoke('wb:plugins:verify', p), rbacCan:, metricsSnapshot: ()=> ipcRenderer.invoke('wb:metrics:snapshot'), (p)=> ipcRenderer.invoke('wb:rbac:can', p),
  // Notifications
  notify: (title, body) => ipcRenderer.send('wb:notify', { title, body }),

  // Version
  getVersion: () => ipcRenderer.invoke('wb:getVersion'),

  // Settings
  getSettings: () => ipcRenderer.invoke('wb:getSettings'),
  updateSettings: (patch) => ipcRenderer.invoke('wb:updateSettings', patch),

  // Offline view
  getOfflineMessages: (limit = 10) => ipcRenderer.invoke('wb:offline:getMessages', { limit }),

  // AI Chat
  aiChat: (messages) => ipcRenderer.invoke('wb:ai:chat', { messages }),

  // Overlay
  toggleOverlay: () => ipcRenderer.invoke('wb:overlay:toggle'),

  // Offline generic
  getOfflineList,

  queueCreate: (data) => ipcRenderer.invoke('wb:queue:create', data),
  queueList: (q) => ipcRenderer.invoke('wb:queue:list', q),
  queueRetry: (data) => ipcRenderer.invoke('wb:queue:retry', data),
  queueResolveConflict: (data) => ipcRenderer.invoke('wb:queue:resolveConflict', data),
  aiWorkflow: (input) => ipcRenderer.invoke('wb:ai:workflow', input),
  setTelemetryOptIn: (val) => ipcRenderer.invoke('wb:telemetry:optin', { optIn: !!val }),
  emailDraft: (draft) => ipcRenderer.invoke('wb:email:draft', draft),
  calendarCreate: (evt) => ipcRenderer.invoke('wb:calendar:create', evt),
  assistantApply: (patch) => ipcRenderer.invoke('wb:assistant:apply', patch),: (table, limit = 10) => ipcRenderer.invoke('wb:offline:getList', { table, limit })

  ,
  // Phase G wrappers
  workflowRun: (wf) => ipcRenderer.invoke('wb:workflow:run', wf),
  orgList: () => ipcRenderer.invoke('wb:org:list'),
  orgSwitch: (p) => ipcRenderer.invoke('wb:org:switch', p),
  pluginsList: () => ipcRenderer.invoke('wb:plugins:list'),
  pluginsToggle: (p) => ipcRenderer.invoke('wb:plugins:toggle', p),
  pluginsHealth: (p) => ipcRenderer.invoke('wb:plugins:health', p)
});
