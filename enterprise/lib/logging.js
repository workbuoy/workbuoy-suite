const levels=['debug','info','warn','error'];
const current=levels.indexOf((process.env.LOG_LEVEL||'info').toLowerCase());
function log(level,msg,obj){ const idx=levels.indexOf(level); if(idx>=current){ console.log(`[${level}]`,msg,obj||''); } }
export const logger={ debug:(m,o)=>log('debug',m,o), info:(m,o)=>log('info',m,o), warn:(m,o)=>log('warn',m,o), error:(m,o)=>log('error',m,o) };
