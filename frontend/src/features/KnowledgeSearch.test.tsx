import { render, screen, fireEvent } from '@testing-library/react';
import { KnowledgeSearch } from './KnowledgeSearch';

test('renders search input', ()=>{
  render(<KnowledgeSearch />);
  expect(screen.getByPlaceholderText(/search knowledge/i)).toBeInTheDocument();
});
