import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import BuoyChat from '../components/BuoyChat'

beforeAll(()=>{
  // mock fetch for /buoy/complete
  global.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith('/buoy/complete')) {
      return new Response(JSON.stringify({ result: [], explanations: [{ reasoning: 'demo', confidence: 0.8 }], confidence: 0.8, correlationId: 'demo-123' }), { status: 200, headers: { 'content-type':'application/json' } });
    }
    return new Response('{}', { status: 404 });
  }) as any;
});

test('buoy chat parses and shows chips', async () => {
  render(<BuoyChat />);
  const input = screen.getByLabelText('buoy-input');
  fireEvent.change(input, { target: { value: 'vis acme siste 30 dager, region vest, lag graf' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  await waitFor(()=> screen.getByText(/kunde: acme/i));
  expect(screen.getByText(/tidsrom: 30d/i)).toBeInTheDocument();
  expect(screen.getByText(/region: vest/i)).toBeInTheDocument();
});
