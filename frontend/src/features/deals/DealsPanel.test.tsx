import { render, screen } from '@testing-library/react';
import { DealsPanel } from './DealsPanel';

jest.mock('@/api', ()=>({
  apiFetch: jest.fn(async ()=>[ {id:'d1', contactId:'c1', value:100, status:'open'} ])
}));

it('renders deals list', async ()=>{
  render(<DealsPanel/>);
  expect(await screen.findByText('d1')).toBeInTheDocument();
});
