import type { IngestAdapter } from './types';
import type { IngestEvent } from '../types';

export class SlackAdapter implements IngestAdapter {
  name(){ return 'slack' as const; }
  async fetch(): Promise<IngestEvent[]> {
    const token = process.env.WB_SLACK_TOKEN;
    if (!token){
      return [{
        source: 'slack',
        kind: 'contact',
        payload: { name: 'Sam Slack', email: 'sam@slack.example', company: 'Slackline AS' },
        link: 'slack://channel/mock-42'
      }];
    }
    return [];
  }
}
