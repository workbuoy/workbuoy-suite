// desktop/src/autoUpdater.ts
import { autoUpdater } from "electron-updater";

export function setupAutoUpdate() {
  autoUpdater.autoDownload = true;
  if ('channel' in autoUpdater) {
    (autoUpdater as any).channel = process.env.CHANNEL || 'stable';
  }
  autoUpdater.on?.('update-downloaded', () => {
    autoUpdater.quitAndInstall?.();
  });
  autoUpdater.checkForUpdatesAndNotify?.();
}
