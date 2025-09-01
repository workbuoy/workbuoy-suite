import { buildComplianceApp } from './app.js';
const port = process.env.PORT || 45850;
const app = buildComplianceApp();
app.listen(port, ()=>console.log('Compliance API listening on :'+port));
