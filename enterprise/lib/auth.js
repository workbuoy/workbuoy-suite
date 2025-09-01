import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

export function signToken(payload, expiresIn='2h'){
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
export function verifyToken(token){
  try { return jwt.verify(token, JWT_SECRET); } catch(e){ return null; }
}
export function requireAuth(req, res){
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/);
  if(!m){ res.status(401).json({error:'missing_token'}); return null; }
  const data = verifyToken(m[1]);
  if(!data){ res.status(401).json({error:'invalid_token'}); return null; }
  return data;
}
