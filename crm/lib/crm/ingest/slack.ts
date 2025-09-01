import type { IngestSource, IngestEvent } from './types';
export class SlackIngest implements IngestSource {
  name(){ return 'slack' as const; }
  async pull(): Promise<IngestEvent[]> {
    // Mock: a lead pinged #sales-inbound
    return [{
      source: 'slack',
      kind: 'contact',
      payload: {
        name: 'Linus Torvalds',
        email: 'linus@kernel.example',
        company: 'Kernel Co',
        domain: 'kernel.example'
      },
      link: 'slack://channel/sales-inbound/p/789'
    }];
  }
}
