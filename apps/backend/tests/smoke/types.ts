export interface BackendRunner {
  url: string;
  stop: () => Promise<void>;
}
