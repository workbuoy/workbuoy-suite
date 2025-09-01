const express = require('express');
const fs = require('fs'); const path = require('path'); const yaml = require('js-yaml');
const app = express(); app.use(express.json());

const port = process.env.MOCK_PORT || 4010;
const specPath = path.join(process.cwd(), 'api', 'openapi.yaml');
const spec = yaml.load(fs.readFileSync(specPath, 'utf8'));

function exampleFor(pathKey, method){
  const op = spec.paths[pathKey]?.[method];
  const res = op?.responses || {};
  const code = Object.keys(res)[0];
  const content = res[code]?.content?.['application/json']?.example;
  return content || { ok:true, mock:true, path:pathKey, method };
}

app.all('*', (req,res)=>{
  const key = req.path.replace(/\/$/, '');
  const method = req.method.toLowerCase();
  if(spec.paths[key] && spec.paths[key][method]){
    res.set('X-WorkBuoy-Sandbox','1');
    res.json(exampleFor(key, method));
  }else{
    res.status(404).json({ error:'not_in_openapi', path:key });
  }
});

app.listen(port, ()=> console.log('Mock server on', port));
