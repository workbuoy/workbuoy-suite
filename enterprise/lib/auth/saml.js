import { DOMParser } from '@xmldom/xmldom';
import { SignedXml } from 'xml-crypto';
import { Buffer } from 'buffer';

function getText(node, tag){
  const el = node.getElementsByTagName(tag)[0];
  return el && (el.textContent || el.firstChild?.data) || null;
}

export function parseAndVerifySamlResponse(base64Response, { idpCert, audience, acsUrl }){
  const xml = Buffer.from(base64Response, 'base64').toString('utf8');
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const signature = doc.getElementsByTagName('ds:Signature')[0] || doc.getElementsByTagName('Signature')[0];
  const sig = new SignedXml();
  sig.keyInfoProvider = { getKeyInfo: ()=>'<X509Data></X509Data>', getKey: ()=> idpCert };
  sig.loadSignature(signature);
  const valid = sig.checkSignature(xml);
  if(!valid) throw new Error('saml_signature_invalid');
  const assertion = doc.getElementsByTagName('saml:Assertion')[0] || doc.getElementsByTagName('Assertion')[0];
  const audienceEl = assertion.getElementsByTagName('saml:Audience')[0] || assertion.getElementsByTagName('Audience')[0];
  const audVal = audienceEl && (audienceEl.textContent || audienceEl.firstChild?.data);
  if(audience && audVal && audVal !== audience) throw new Error('saml_audience_mismatch');
  const subject = assertion.getElementsByTagName('saml:Subject')[0];
  const nameIdEl = subject && (subject.getElementsByTagName('saml:NameID')[0] || subject.getElementsByTagName('NameID')[0]);
  const nameId = nameIdEl && (nameIdEl.textContent || nameIdEl.firstChild?.data);
  // Minimal attribute extraction
  const attrs = {};
  const attrNodes = assertion.getElementsByTagName('saml:Attribute');
  for(let i=0;i<attrNodes.length;i++){
    const a = attrNodes[i];
    const name = a.getAttribute('Name');
    const valEl = a.getElementsByTagName('saml:AttributeValue')[0] || a.getElementsByTagName('AttributeValue')[0];
    const val = valEl && (valEl.textContent || valEl.firstChild?.data);
    if(name) attrs[name]=val;
  }
  return { nameId, attributes: attrs };
}
