export async function searchPages({ query }){
  await new Promise(r=>setTimeout(r, 25));
  return [{ id:'n1', title:'Project Brief: Kraken', matched: query }];
}
