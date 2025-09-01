export async function fetchIssues({ repo }){
  // stub: simulate external API latency and response
  await new Promise(r=>setTimeout(r, 30));
  return [{ id: 1, title: 'Update README', state:'open', repo }];
}
