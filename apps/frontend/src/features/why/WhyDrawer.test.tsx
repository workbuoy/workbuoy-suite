import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { WhyDrawer } from './WhyDrawer';

vi.mock('@/api', ()=>({
  apiFetch: vi.fn(async ()=>({ log: [ {id:'a1', action:'create', ts:123, method:'POST', route:'/x'} ] }))
}));

it('renders audit drawer', async ()=>{
  render(<WhyDrawer targetId="x"/>);
  expect(await screen.findByText(/Audit trail/)).toBeInTheDocument();
});
