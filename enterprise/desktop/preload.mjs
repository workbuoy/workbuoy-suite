import { contextBridge } from 'electron';
contextBridge.exposeInMainWorld('wbDesktop', {
  version: 'scaffold',
  notify: (title, body)=> new Notification(title, { body })
});
