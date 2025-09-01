import type { IngestEvent } from '../types';

export interface IngestAdapter {
  name(): 'gmail'|'calendar'|'slack';
  fetch(): Promise<IngestEvent[]>;
}
