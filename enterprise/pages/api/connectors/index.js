import { withAuth } from '../../../lib/auth/oidc';
import * as infor_m3 from '../../../lib/connectors/infor_m3';
import * as netsuite from '../../../lib/connectors/netsuite';
import * as jira from '../../../lib/connectors/jira_cloud';
import * as zoom from '../../../lib/connectors/zoom';
import * as gdrive from '../../../lib/connectors/google_drive';
import * as bamboohr from '../../../lib/connectors/bamboohr';
import * as qlik from '../../../lib/connectors/qlik_sense';

import * as sharepoint from '../../../lib/connectors/sharepoint';
  import * as workday from '../../../lib/connectors/workday';
  import * as servicenow from '../../../lib/connectors/servicenow';
  import * as oracle_fusion from '../../../lib/connectors/oracle_fusion';
  import * as adobe_experience from '../../../lib/connectors/adobe_experience';
  import * as ifs_erp from '../../../lib/connectors/ifs_erp';

  const list = [infor_m3, netsuite, jira, zoom, gdrive, bamboohr, qlik, sharepoint, workday, servicenow, oracle_fusion, adobe_experience, ifs_erp ];

export default withAuth(async function handler(req, res){
  if (req.method === 'GET'){
    return res.json({ connectors: list.map(c=>({ name: c.name })) });
  }
  if (req.method === 'POST'){
    const { name } = req.body || {};
    const found = list.find(c=>c.name===name);
    if (!found) return res.status(404).json({ ok:false, error:'not_found' });
    const r = await found.sync(req.tenantId || req.user?.tenant);
    return res.json({ ok: true, result: r });
  }
  res.setHeader('Allow','GET,POST');
  res.status(405).end();
});
