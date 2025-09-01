import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('wb', {
  updater: {
    check: () => ipcRenderer.invoke('updater:check'),
    download: () => ipcRenderer.invoke('updater:download'),
    install: () => ipcRenderer.invoke('updater:install'),
    onEvent: (cb: (e:any)=>void) => ipcRenderer.on('updater:event', (_,_payload) => cb(_payload))
  },
  notify: (title: string, body?: string) => ipcRenderer.invoke('notify:show', { title, body })
});
