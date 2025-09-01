
import React from 'react';
import fs from 'fs';
import path from 'path';
import PortalLayout from '../../components/PortalLayout';
import { wbInfoPageViews } from '../../lib/metrics/registry.js';

export async function getServerSideProps(){
  try{ wbInfoPageViews.inc(); }catch(_){}
  const p = process.env.WB_INFO_MD_PATH || path.join(process.cwd(),'config','info.md');
  let md = '';
  try{ md = fs.readFileSync(p,'utf-8'); }catch(e){ md = ''; }
  return { props: { md } };
}

export default function Info({md}){
  // naive markdown to HTML
  const html = md.replace(/^# (.*)$/mg,'<h1>$1</h1>').replace(/^\- (.*)$/mg,'<li>$1</li>').replace(/\n\n/g,'<br/>');
  return <PortalLayout>
    <div dangerouslySetInnerHTML={{__html: html}} />
  </PortalLayout>;
}
