
export interface SearchRequest {
  text: string;
  filters?: Record<string, string|number|boolean|string[]>;
  scope?: 'user'|'team'|'org';
}
export interface SearchResult { docId:string; score:number; snippet?:string; }
export interface KnowledgeIndex { search(req: SearchRequest): Promise<SearchResult[]>; }
export const StubIndex: KnowledgeIndex = { async search(){ return []; } };
