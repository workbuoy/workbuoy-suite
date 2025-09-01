import { parseAndVerifySamlResponse } from '../../../../lib/auth/saml.js';
import jwt from 'jsonwebtoken';

export default async function handler(req,res){
  const samlResponse = req.body?.SAMLResponse || req.body?.samlResponse || req.query?.SAMLResponse;
  if(!samlResponse) return res.status(400).json({ error:'missing_saml_response' });
  try{
    const info = parseAndVerifySamlResponse(samlResponse, {
      idpCert: process.env.SAML_IDP_CERT || '',
      audience: process.env.SAML_ENTITY_ID || 'workbuoy',
      acsUrl: process.env.SAML_ACS_URL || '/api/auth/saml/acs'
    });
    const app = jwt.sign({ sub: info.nameId, email: info.attributes['email'] || info.attributes['Email'] || info.nameId }, process.env.APP_JWT_SECRET||'devsecret', { expiresIn:'8h' });
    res.redirect(`/portal?login=saml&ok=1&token=${app}`);
  }catch(e){
    res.status(400).json({ error:String(e.message||e) });
  }
}
