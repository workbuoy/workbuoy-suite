import { mapHubSpotCompanyToCompany, mapZendeskTicketToTicket } from '../lib/crm/recognition.js';

test('HubSpot Company → Company', () => {
  const hs = { id:'101', properties:{ name:'Globex', domain:'globex.com' } };
  const c = mapHubSpotCompanyToCompany(hs);
  expect(c.type).toBe('company');
  expect(c.name).toBe('Globex');
  expect(c.domain).toBe('globex.com');
});

test('Zendesk Ticket → Ticket', () => {
  const z = { id: 42, subject: 'Need help', status: 'open', requester_email: 'user@globex.com', organization_id: 'c123' };
  const t = mapZendeskTicketToTicket(z);
  expect(t.type).toBe('ticket');
  expect(t.subject).toBe('Need help');
  expect(t.requesterEmail).toBe('user@globex.com');
});
