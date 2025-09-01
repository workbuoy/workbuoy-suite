export async function getSecret(key){
  const backend=(process.env.WB_SECRET_BACKEND||'env').toLowerCase();
  if(backend==='env'){ return process.env[key]; }
  if(backend==='aws'){
    try{
      const AWS=await import('aws-sdk'); const sm=new AWS.SecretsManager();
      const data=await sm.getSecretValue({ SecretId:key }).promise();
      if(data.SecretString) return data.SecretString;
    }catch(e){ return process.env[key]; }
  }
  return process.env[key];
}
