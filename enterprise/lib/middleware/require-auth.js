export function requireAuth(handler){
  return async (req,res)=>{
    const dev = (process.env.NODE_ENV || 'development') !== 'production';
    const authed = dev || (req.headers['cookie'] || req.headers['authorization']);
    if(!authed) return res.status(401).json({ ok:false, error:'unauthorized' });
    return handler(req,res);
  };
}
