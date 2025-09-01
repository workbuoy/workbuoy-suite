import type { IngestSource, IngestEvent } from './types';

export class GmailIngest implements IngestSource {
  name() { return 'gmail' as const; }
  async pull(): Promise<IngestEvent[]> {
    // Mock: pretend we found a thread where a new contact wrote in
    return [{
      source: 'gmail',
      kind: 'contact',
      payload: {
        name: 'Grace Hopper',
        email: 'grace@navy.example',
        company: 'Navy Computing',
        domain: 'navy.example'
      },
      link: 'gmail://thread/abc123'
    },{
      source: 'gmail',
      kind: 'deal',
      payload: {
        name: 'Onboarding Package',
        amount: 25000,
        stage: 'Lead',
        company: 'Navy Computing'
      },
      link: 'gmail://thread/abc123'
    }];
  }
}
