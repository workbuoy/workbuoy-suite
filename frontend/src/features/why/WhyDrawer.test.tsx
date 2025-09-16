import { render, screen } from '@testing-library/react';
import { WhyDrawer } from './WhyDrawer';

jest.mock('@/api/client', ()=>({
  apiFetch: jest.fn(async ()=>[ {id:'a1', action:'create', ts:123} ])
}));

it('renders audit drawer', async ()=>{
  render(<WhyDrawer targetId="x"/>);
  expect(await screen.findByText(/Audit trail/)).toBeInTheDocument();
});
