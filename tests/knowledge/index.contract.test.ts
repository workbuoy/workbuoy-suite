import { getKnowledgeIndex } from '../../src/core/knowledge';

describe('Knowledge index contract', ()=>{
  it('supports search', async ()=>{
    const idx = getKnowledgeIndex();
    const r = await idx.search('foo');
    expect(r).toHaveProperty('results');
  });
});
