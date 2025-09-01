import type { IngestAdapter } from './types';
import type { IngestEvent } from '../types';

export class GmailAdapter implements IngestAdapter {
  name(){ return 'gmail' as const; }
  async fetch(): Promise<IngestEvent[]> {
    const token = process.env.WB_GMAIL_TOKEN;
    if (!token){
      // mock data
      return [{
        source: 'gmail',
        kind: 'contact',
        payload: { name: 'Gina Mail', email: 'gina@mail.example', company: 'Mail Co' },
        link: 'gmail://thread/mock-001'
      }];
    }
    // TODO: fetch real gmail, parse → events
    return [];
  }
}
