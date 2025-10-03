import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

type ElectronApp = {
  getPath: (name: string) => string;
  whenReady: () => Promise<void>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  quit: () => void;
};

type ElectronWindow = {
  loadURL: (url: string) => Promise<void>;
  on: (event: string, handler: (...args: any[]) => void) => void;
};

type ElectronDialog = {
  showMessageBox: (window: ElectronWindow | null, options: any) => Promise<{ response: number }>;
};

let electronApp: ElectronApp;
let BrowserWindowCtor: new (options: any) => ElectronWindow;
let electronDialog: ElectronDialog;

try {
  const electron = require('electron');
  electronApp = electron.app as ElectronApp;
  BrowserWindowCtor = electron.BrowserWindow as new (options: any) => ElectronWindow;
  electronDialog = electron.dialog as ElectronDialog;
} catch {
  electronApp = {
    getPath: () => process.cwd(),
    whenReady: async () => {},
    on: () => {},
    quit: () => {},
  };
  BrowserWindowCtor = class {
    constructor(_options: any) {}
    async loadURL() {}
    on() {}
  } as any;
  electronDialog = {
    showMessageBox: async () => ({ response: 1 }),
  };
}

let autoUpdater: {
  autoDownload: boolean;
  setFeedURL?: (config: any) => void;
  checkForUpdates?: () => Promise<void>;
  checkForUpdatesAndNotify?: () => Promise<void>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  quitAndInstall?: () => void;
};

try {
  autoUpdater = require('electron-updater').autoUpdater;
} catch {
  autoUpdater = {
    autoDownload: false,
    setFeedURL: () => {},
    checkForUpdates: async () => {},
    checkForUpdatesAndNotify: async () => {},
    on: () => {},
    quitAndInstall: () => {},
  };
}

function createWindow() {
  const window = new BrowserWindowCtor({ width: 900, height: 700 });
  void window.loadURL('data:text/html,<h1>WorkBuoy</h1><p>Auto-update demo</p>');
  return window;
}

electronApp.whenReady().then(async () => {
  const window = createWindow();

  const channel = process.env.WB_UPDATE_CHANNEL || 'stable';
  const feedURL = process.env.WB_UPDATE_URL || `https://updates.example.com/workbuoy/${channel}`;
  try {
    autoUpdater.setFeedURL?.({ provider: 'generic', url: feedURL });
  } catch {
    // ignore – running without real updater backend
  }

  autoUpdater.on?.('update-available', () => console.log('Update available'));
  autoUpdater.on?.('update-not-available', () => console.log('No update available'));
  autoUpdater.on?.('error', (error: unknown) => console.error('Updater error', error));
  autoUpdater.on?.('download-progress', (progress: any) => console.log('Progress', progress.percent));
  autoUpdater.on?.('update-downloaded', async () => {
    const res = await electronDialog.showMessageBox(window, {
      message: 'Oppdatering lastet ned. Start på nytt nå?',
      buttons: ['Restart', 'Later'],
    });
    if (res.response === 0) {
      autoUpdater.quitAndInstall?.();
    }
  });

  setTimeout(() => autoUpdater.checkForUpdates?.(), 2_000);
});

electronApp.on('window-all-closed', () => electronApp.quit());
