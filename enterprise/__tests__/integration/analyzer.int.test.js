import { analyzeProject } from '../../lib/meta/analyzer.js';

test('analyzer returns basic stats', ()=>{
  const stats = analyzeProject(process.cwd());
  expect(stats.totalFiles).toBeGreaterThan(10);
});