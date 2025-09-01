import notifier from 'node-notifier';

export function notify(title: string, message: string) {
  try {
    notifier.notify({ title, message, wait: false, timeout: 5 });
  } catch {
    console.log(`[notify] ${title}: ${message}`);
  }
}
