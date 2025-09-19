import { render, screen } from '@testing-library/react';
import { ContactsPanel } from './ContactsPanel';

jest.mock('@/api/client', ()=>({
  apiFetch: jest.fn(async ()=>[ {id:'1', name:'A', email:'a@test', phone:'123'} ])
}));

it('renders contacts list', async ()=>{
  render(<ContactsPanel/>);
  expect(await screen.findByText('A')).toBeInTheDocument();
});
