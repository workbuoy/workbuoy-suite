// NOTE: In the integrated repo, this file should be replaced by the full implementation from PR AO.
// This placeholder exists only to keep the PR AP package structure valid in isolation.
export class AdaptiveClient {
  constructor(){}
  async request(url, init){ return fetch(url, init); }
}
