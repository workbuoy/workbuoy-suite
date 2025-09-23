import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import scimRoutes from '../src/scim/routes.js';

const app = express();
app.use(bodyParser.json());
app.use('/api/scim/v2', scimRoutes);

process.env.SCIM_ENABLED='true';

(async ()=>{
  const r = await request(app).post('/api/scim/v2/Users').send({userName:'alice'});
  if(r.status!==201) throw new Error('SCIM create failed');
  console.log('SCIM test ok');
})();
