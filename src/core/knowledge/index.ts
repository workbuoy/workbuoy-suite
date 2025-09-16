import { KnowledgeIndex } from './base';
import { StubKnowledgeIndex } from './stubIndex';
import { FileKnowledgeIndex } from './fileIndex';

export function getKnowledgeIndex(): KnowledgeIndex {
  const mode = process.env.KNOWLEDGE_MODE || 'stub';
  if (mode==='file') return new FileKnowledgeIndex();
  return new StubKnowledgeIndex();
}
