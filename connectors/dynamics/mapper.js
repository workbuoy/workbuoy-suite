import fs from 'fs';
import YAML from 'yaml';

function get(obj, path){
  return path.split('.').reduce((o,k)=> (o && o[k] !== undefined) ? o[k] : undefined, obj);
}

export class Mapper {
  constructor(mappingFile){
    this.cfg = YAML.parse(fs.readFileSync(mappingFile,'utf8'));
  }
  forType(type){
    const m = this.cfg[type];
    if (!m) throw new Error('no mapping for '+type);
    return new TypeMapper(m);
  }
}

class TypeMapper {
  constructor(m){ this.m = m; }
  entitySet(){ return this.m.entitySet; } // e.g. contacts, opportunities
  alternateKey(){ return this.m.alternateKey; } // attribute logical name configured as alternate key
  keyValue(evt){ return get(evt, this.m.keyValue) ?? get(evt, 'external_id'); }
  fields(evt){
    const out = {};
    for (const [target, source] of Object.entries(this.m.fields || {})){
      out[target] = get(evt, source);
    }
    return out;
  }
}
