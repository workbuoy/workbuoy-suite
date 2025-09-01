import type { NextApiRequest, NextApiResponse } from 'next';
import client from 'prom-client';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    res.setHeader('Content-Type', client.register.contentType);
    res.status(200).send(await client.register.metrics());
  } catch (e: any) {
    res.status(500).send(`# metrics error: ${e?.message ?? 'unknown'}`);
  }
}
