// Cross-platform notifications for Desktop (Electron/Node fallback)
import os from 'os';

export function notify(title: string, message: string) {
  try {
    if ((global as any).Notification) {
      new Notification(title, { body: message });
    } else {
      console.log(`[NOTIFY] ${title}: ${message}`);
    }
  } catch (e) {
    console.log(`[NOTIFY:FALLBACK] ${title}: ${message}`);
  }
}
