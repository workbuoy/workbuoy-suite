// Minimal update server (no dependencies). Serves /feed/:channel/latest.json and /artifacts/*
// Usage: UPDATE_REPO=./update_repo PORT=45900 node scripts/update_server.js
import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

const PORT = Number(process.env.PORT || 45900);
const REPO = process.env.UPDATE_REPO || path.join(process.cwd(), 'update_repo');

function send(res, code, body, headers={}){
  res.writeHead(code, {'content-type':'application/json', ...headers});
  res.end(body);
}

function serveFile(res, file, contentType='application/octet-stream'){
  try {
    const data = fs.readFileSync(file);
    res.writeHead(200, {'content-type': contentType});
    res.end(data);
  } catch (e) {
    res.writeHead(404, {'content-type': 'text/plain'});
    res.end('not found');
  }
}

const server = http.createServer((req,res)=>{
  const parsed = url.parse(req.url, true);
  if (parsed.pathname === '/' || parsed.pathname === '/health'){
    return send(res, 200, JSON.stringify({ ok:true, repo: REPO }));
  }
  // /feed/<channel>/latest.json
  const feedMatch = parsed.pathname.match(/^\/feed\/(stable|beta)\/latest\.json$/);
  if (feedMatch){
    const channel = feedMatch[1];
    const file = path.join(REPO, channel, 'latest.json');
    return serveFile(res, file, 'application/json');
  }
  // /artifacts/<file>
  const artMatch = parsed.pathname.match(/^\/artifacts\/(.+)$/);
  if (artMatch){
    const file = path.join(REPO, 'artifacts', artMatch[1]);
    const ext = path.extname(file).toLowerCase();
    const ct = ext === '.zip' ? 'application/zip' : 'application/octet-stream';
    return serveFile(res, file, ct);
  }
  res.writeHead(404, {'content-type':'text/plain'}); res.end('not found');
});

server.listen(PORT, ()=>console.log(`Update server on :${PORT}, repo=${REPO}`));
