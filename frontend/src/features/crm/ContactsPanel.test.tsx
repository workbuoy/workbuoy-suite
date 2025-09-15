// frontend/src/features/crm/ContactsPanel.test.tsx
import { render, screen } from '@testing-library/react';
import ContactsPanel from './ContactsPanel';
global.fetch = jest.fn(()=>Promise.resolve({ json:()=>Promise.resolve([{id:'1', name:'Test'}]) })) as any;
test('renders contacts panel', async () => {
  render(<ContactsPanel />);
  expect(await screen.findByText('Test')).toBeInTheDocument();
});
