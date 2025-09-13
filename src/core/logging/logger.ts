type Level = 'debug'|'info'|'warn'|'error';
function log(level: Level, msg: string, meta: Record<string,any> = {}){
  const entry = { level, msg, ts: new Date().toISOString(), ...meta };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry));
}
export default { debug:(m:string,x?:any)=>log('debug',m,x), info:(m:string,x?:any)=>log('info',m,x), warn:(m:string,x?:any)=>log('warn',m,x), error:(m:string,x?:any)=>log('error',m,x) };
