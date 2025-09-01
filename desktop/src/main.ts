import { app, BrowserWindow, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

function create() {
  const w = new BrowserWindow({ width: 900, height: 700 });
  w.loadURL('data:text/html,<h1>WorkBuoy</h1><p>Auto-update demo</p>');
}

app.whenReady().then(async () => {
  create();

  const channel = process.env.WB_UPDATE_CHANNEL || 'stable';
  const feedURL = process.env.WB_UPDATE_URL || `https://updates.example.com/workbuoy/${channel}`;
  // electron-updater reads publish config; runtime URL override helps local tests
  try {
    autoUpdater.setFeedURL({ provider: 'generic', url: feedURL });
  } catch {}

  autoUpdater.on('update-available', () => console.log('Update available'));
  autoUpdater.on('update-not-available', () => console.log('No update available'));
  autoUpdater.on('error', (e) => console.error('Updater error', e));
  autoUpdater.on('download-progress', (p) => console.log('Progress', p.percent));
  autoUpdater.on('update-downloaded', async () => {
    const res = await dialog.showMessageBox({
      message: 'Oppdatering lastet ned. Start på nytt nå?',
      buttons: ['Restart', 'Later']
    });
    if (res.response === 0) autoUpdater.quitAndInstall();
  });

  // Kick check
  setTimeout(() => autoUpdater.checkForUpdates(), 2000);
});

app.on('window-all-closed', () => app.quit());
