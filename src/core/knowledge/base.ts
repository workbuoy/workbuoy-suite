export interface KnowledgeIndex {
  search(q:string): Promise<{results:any[]}>;
}
