// desktop/src/autoUpdater.ts
import { autoUpdater } from "electron-updater";

export function setupAutoUpdate() {
  autoUpdater.autoDownload = true;
  autoUpdater.channel = process.env.CHANNEL || "stable";
  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
  });
  autoUpdater.checkForUpdatesAndNotify();
}
