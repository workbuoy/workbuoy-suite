import { render, screen } from '@testing-library/react';
import { WhyDrawer } from './WhyDrawer';

jest.mock('@/api', ()=>({
  apiFetch: jest.fn(async ()=>({ log: [ {id:'a1', action:'create', ts:123, method:'POST', route:'/x'} ] }))
}));

it('renders audit drawer', async ()=>{
  render(<WhyDrawer targetId="x"/>);
  expect(await screen.findByText(/Audit trail/)).toBeInTheDocument();
});
