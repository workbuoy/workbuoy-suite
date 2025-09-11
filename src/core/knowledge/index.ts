export interface KnowledgeQuery {
  query: string;
  topN: number;
}

export async function searchKnowledge(query: KnowledgeQuery) {
  // TODO: implement search using vector database or knowledge index
  return [] as const;
}
