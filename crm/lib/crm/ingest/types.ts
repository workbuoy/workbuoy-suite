export type IngestEvent = {
  source: 'gmail'|'calendar'|'slack';
  kind: 'contact'|'deal';
  payload: any;
  link?: string;
};

export interface IngestSource {
  name(): 'gmail'|'calendar'|'slack';
  pull(): Promise<IngestEvent[]>;
}
