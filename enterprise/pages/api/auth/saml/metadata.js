export default function handler(_req,res){
  const entity = process.env.SAML_ENTITY_ID || 'workbuoy';
  const acs = process.env.SAML_ACS_URL || '/api/auth/saml/acs';
  const xml = `<?xml version="1.0"?>
<EntityDescriptor entityID="${entity}" xmlns="urn:oasis:names:tc:SAML:2.0:metadata">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${acs}" index="0"/>
  </SPSSODescriptor>
</EntityDescriptor>`;
  res.setHeader('content-type','application/xml'); res.send(xml);
}
