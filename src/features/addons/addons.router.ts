// src/features/addons/addons.router.ts
import { Router } from 'express';
import { addonsForRequest } from './addons.registry';
const r = Router();
r.get('/addons', (req, res) => res.json({ addons: addonsForRequest(req) }));
export default r;
