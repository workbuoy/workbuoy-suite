import { client } from '../../lib/metrics/registry';
export const config = { api: { bodyParser: false } };
export default async function handler(req, res){
  res.setHeader('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
}
