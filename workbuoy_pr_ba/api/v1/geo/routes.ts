import express from 'express';
import { geocodeOne } from '../../services/geocode/mapbox_client';
export const router = express.Router();

router.post('/geocode', async (req, res) => {
  const { addresses } = req.body || {};
  const results = [];
  for (const a of (addresses||[])) {
    results.push(await geocodeOne(a));
  }
  res.json({ results });
});
