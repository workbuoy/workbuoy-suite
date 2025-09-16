import { KnowledgeIndex } from './base';
export class StubKnowledgeIndex implements KnowledgeIndex {
  async search(q:string){ return { results: [] }; }
}
