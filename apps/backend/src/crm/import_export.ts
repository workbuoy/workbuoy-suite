import { Router, Request, Response } from 'express';
import { pipeline } from 'stream';
import { parse } from 'csv-parse';
import busboy from 'busboy';
import { z } from 'zod';
import { redis } from '../db/redis.js';
import { importCounter, exportCounter } from '../observability/metrics.js';
import { ContactCreate, OpportunityCreate } from './validation.js';
import { auditRecord } from '../audit/audit.js';

export const importExportRouter = Router();

// Map entity->schema
const schemas:any = {
  contacts: ContactCreate,
  opportunities: OpportunityCreate,
};

// Import
importExportRouter.post('/import', async (req: Request, res: Response) => {
  const bb = busboy({ headers: req.headers });
  const entity = req.query.entity as string;
  const dryRun = (req.query.dry_run === 'true');
  if (!entity || !schemas[entity]) return res.status(400).json({ error: 'bad entity' });
  const schema = schemas[entity];
  let ok=0, fail=0, errors:any[]=[];
  bb.on('file',(name,file,info)=>{
    if(info.filename.endsWith('.csv')){
      file.pipe(parse({columns:true})).on('data', async (row)=>{
        try{
          const parsed = schema.parse(row);
          ok++;
          if(!dryRun){ /* persist stubbed */ }
        }catch(e:any){
          fail++;
          errors.push({line: ok+fail, error:e.message});
          const key=`dlq:crm:${entity}:${new Date().toISOString().slice(0,10)}`;
          await redis.rPush(key, JSON.stringify(row));
        }
      });
    }else{
      fail++; errors.push({error:'unsupported format'});
    }
  });
  bb.on('close', async ()=>{
    importCounter.inc({entity,status:'success'}, ok);
    importCounter.inc({entity,status:'failed'}, fail);
    await auditRecord({ tenant_id:(req as any).tenant_id, actor_user_id:(req as any).actor_user_id, entity_type:entity, entity_id:'*', action:'create', after:{ok,fail}, trace_id:(req as any).trace_id});
    res.json({ok,fail,errors:errors.slice(0,50)});
  });
  req.pipe(bb);
});

// Export
importExportRouter.get('/export', async (req,res)=>{
  const entity = req.query.entity as string;
  if(!entity || !schemas[entity]) return res.status(400).json({error:'bad entity'});
  const format = (req.query.format as string)||'json';
  exportCounter.inc({entity});
  res.setHeader('Content-Disposition', `attachment; filename=${entity}.${format}`);
  if(format==='json'){
    res.write('[]');
    res.end();
  }else{
    res.write('id,name\n');
    res.end();
  }
});

// DLQ view
importExportRouter.get('/dlq', async (req,res)=>{
  const entity = req.query.entity as string;
  if(!entity) return res.status(400).json({error:'need entity'});
  const key=`dlq:crm:${entity}:${new Date().toISOString().slice(0,10)}`;
  const items=await redis.lRange(key,0,9);
  res.json({items:items.map(i=>JSON.parse(i))});
});
