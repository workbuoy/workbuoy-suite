const cache = new Map();

async function getEnv(name){ return process.env[name]; }

export async function getSecret(name){
  if(cache.has(name)) return cache.get(name);
  const provider = (process.env.SECRETS_PROVIDER||'env').toLowerCase();
  let value = null;
  if(provider==='env'){
    value = await getEnv(name);
  }else{
    // TODO: integrate cloud SDKs; fallback to env for now.
    value = await getEnv(name);
  }
  cache.set(name, value);
  return value;
}

export default { getSecret };
