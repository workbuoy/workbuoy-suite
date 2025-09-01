import { app, BrowserWindow, ipcMain, nativeTheme, Notification } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import os from 'os';

function createWindow() {
  const win = new BrowserWindow({
    width: 980,
    height: 620,
    title: 'WorkBuoy Desktop',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile(path.join(__dirname, 'renderer/index.html'));
  return win;
}

function setupAutoUpdate(win: BrowserWindow) {
  const updateURL = process.env.WB_UPDATE_URL || 'https://updates.example.com/workbuoy/stable';
  const channel = process.env.WB_UPDATE_CHANNEL || 'stable';
  const autoupdateEnabled = (process.env.WB_AUTOUPDATE || 'true') === 'true';

  try {
    // Configure feed; electron-updater reads publish config but we allow override:
    // @ts-ignore
    autoUpdater.setFeedURL({ provider: 'generic', url: updateURL, channel });
  } catch {}

  autoUpdater.autoDownload = autoupdateEnabled;
  autoUpdater.on('checking-for-update', () => win.webContents.send('updater:event', { type: 'checking' }));
  autoUpdater.on('update-available', (info) => win.webContents.send('updater:event', { type: 'available', info }));
  autoUpdater.on('update-not-available', () => win.webContents.send('updater:event', { type: 'not-available' }));
  autoUpdater.on('error', (err) => win.webContents.send('updater:event', { type: 'error', error: String(err) }));
  autoUpdater.on('download-progress', (p) => win.webContents.send('updater:event', { type: 'progress', percent: p.percent }));
  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('updater:event', { type: 'downloaded' });
    if (autoupdateEnabled) {
      autoUpdater.quitAndInstall();
    }
  });

  ipcMain.handle('updater:check', async () => { try { await autoUpdater.checkForUpdates(); return { ok: true }; } catch (e:any){ return { ok:false, error: String(e) }; } });
  ipcMain.handle('updater:download', async () => { try { await autoUpdater.downloadUpdate(); return { ok: true }; } catch (e:any){ return { ok:false, error: String(e) }; } });
  ipcMain.handle('updater:install', async () => { try { autoUpdater.quitAndInstall(); return { ok: true }; } catch (e:any){ return { ok:false, error: String(e) }; } });
}

function setupNotifications() {
  ipcMain.handle('notify:show', (_evt, payload: { title: string; body?: string }) => {
    try {
      new Notification({ title: payload.title, body: payload.body || '' }).show();
      return { ok: true };
    } catch (e:any) {
      return { ok: false, error: String(e) };
    }
  });
}

app.whenReady().then(() => {
  const win = createWindow();
  setupAutoUpdate(win);
  setupNotifications();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
