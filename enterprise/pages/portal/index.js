
import React from 'react';
import PortalLayout from '../../components/PortalLayout';
export default function PortalIndex(){
  return <PortalLayout>
    <h1>Dashboard</h1><div className='mt-3'><a href='/desktop' className='px-3 py-2 rounded-xl bg-black text-white'>Last ned desktop</a> <a href='/docs/DESKTOP_README.md' className='ml-3 underline'>Kommer snart</a></div>
    <p>Velkommen! Her ser du status og neste steg.</p>
  </PortalLayout>;
}
