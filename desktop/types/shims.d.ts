declare module 'electron' {
  export const app: {
    getPath: (name: string) => string;
    whenReady: () => Promise<void>;
    on: (event: string, handler: (...args: any[]) => void) => void;
    quit: () => void;
  };

  export class BrowserWindow {
    constructor(options: any);
    loadURL(url: string): Promise<void>;
    on(event: string, handler: (...args: any[]) => void): void;
  }

  export const dialog: {
    showMessageBox: (window: BrowserWindow | null, options: any) => Promise<{ response: number }>;
  };

  export class Notification {
    constructor(options: { title: string; body: string });
    show(): void;
  }
}

declare module 'electron-updater' {
  export const autoUpdater: {
    autoDownload: boolean;
    channel?: string;
    setFeedURL: (config: any) => void;
    checkForUpdates: () => Promise<void>;
    checkForUpdatesAndNotify: () => Promise<void>;
    on: (event: string, handler: (...args: any[]) => void) => void;
    quitAndInstall: () => void;
  };
}

declare module 'node-notifier' {
  const notifier: { notify: (message: unknown) => void };
  export default notifier;
}

declare module 'better-sqlite3' {
  const Database: any;
  export default Database;
}
