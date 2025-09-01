import type { IngestSource, IngestEvent } from './types';
export class CalendarIngest implements IngestSource {
  name(){ return 'calendar' as const; }
  async pull(): Promise<IngestEvent[]> {
    // Mock: new meeting invite suggests a deal follow-up
    return [{
      source: 'calendar',
      kind: 'deal',
      payload: {
        name: 'Q4 Pilot',
        amount: 10000,
        stage: 'Qualification',
        company: 'Acme Inc'
      },
      link: 'calendar://event/evt456'
    }];
  }
}
