import dynamic from 'next/dynamic';
import React from 'react';
const UnifiedInput = dynamic(()=>import('../../components/UnifiedInput'), {ssr:false});

export default function UnifiedPage(){
  return <div style={{maxWidth:900, margin:'0 auto'}}><h1>Unified Box</h1><UnifiedInput/></div>;
}
