import useSWR from 'swr';
const fetcher = (url)=> fetch(url).then(r=>r.json());
export default function UsagePage(){
  const { data } = useSWR('/api/usage/summary', fetcher);
  if (!data) return <div>Loading...</div>;
  return <div>
    <h1>Usage & Quotas</h1>
    <pre>{JSON.stringify(data,null,2)}</pre>
  </div>;
}
