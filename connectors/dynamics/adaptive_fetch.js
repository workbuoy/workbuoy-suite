import fetch from 'node-fetch';

export async function adaptiveFetch(url, init={}, opts={}){
  const { maxRetries=5, baseDelayMs=100 } = opts;
  let attempt = 0;
  while (true){
    const res = await fetch(url, init);
    if (res.status < 500 && res.status !== 429) return res;
    if (attempt >= maxRetries) return res;
    let wait = baseDelayMs * Math.pow(2, attempt);
    const ra = res.headers.get('retry-after');
    if (ra){
      const n = Number(ra);
      if (!Number.isNaN(n)) wait = Math.max(wait, n*1000);
    }
    await new Promise(r=>setTimeout(r, wait));
    attempt++;
  }
}
