import dynamic from 'next/dynamic';
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs(){
  return <div style={{padding:16}}><SwaggerUI url="/api/openapi.yaml" /></div>;
}
