import type { IngestAdapter } from './types';
import type { IngestEvent } from '../types';

export class CalendarAdapter implements IngestAdapter {
  name(){ return 'calendar' as const; }
  async fetch(): Promise<IngestEvent[]> {
    const token = process.env.WB_CALENDAR_TOKEN;
    if (!token){
      return [{
        source: 'calendar',
        kind: 'deal',
        payload: { name: 'Calendar Intro', amount: 5000, stage: 'Lead', company: 'Calendar Co' },
        link: 'calendar://event/mock-777'
      }];
    }
    return [];
  }
}
