import { AutonomyLevel, allows } from '../autonomy/levels';
export const requiresLevel = (min: AutonomyLevel) => (req,res,next) =>
  allows(min) ? next() : res.status(403).json({ error: `Requires L${min}` });
