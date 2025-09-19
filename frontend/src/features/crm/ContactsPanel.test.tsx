import { render, screen, fireEvent } from '@testing-library/react';
import { ContactsPanel } from './ContactsPanel';

jest.mock('@/api', ()=>({
  apiFetch: jest.fn(async ()=>[ {id:'1', name:'A', email:'a@test', phone:'123'} ])
}));

it('renders contacts list', async ()=>{
  render(<ContactsPanel/>);
  expect(await screen.findByText('A')).toBeInTheDocument();
});

it('calls onClose when close button clicked', async ()=>{
  const handleClose = jest.fn();
  render(<ContactsPanel onClose={handleClose}/>);
  fireEvent.click(await screen.findByRole('button', { name: /close/i }));
  expect(handleClose).toHaveBeenCalled();
});
