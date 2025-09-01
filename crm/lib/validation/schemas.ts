import { z } from 'zod';

export const CompanySchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1).optional().nullable(),
});

export const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
});

export const DealSchema = z.object({
  name: z.string().min(1),
  amount: z.preprocess(v => (typeof v === 'string' ? Number(v) : v), z.number().nonnegative().optional().nullable()),
  stage: z.enum(['Lead','Qualification','Proposal','Negotiation','Won','Lost']).optional().nullable(),
  companyId: z.string().optional().nullable(),
  owner: z.string().optional().nullable(),
});

export const TicketSchema = z.object({
  subject: z.string().min(1),
  status: z.string().optional().nullable(),
  requesterEmail: z.string().email().optional().nullable(),
  companyId: z.string().optional().nullable(),
});

export const TaskSchema = z.object({
  title: z.string().min(1),
  status: z.enum(['open','done']).optional(),
  dueAt: z.string().datetime().optional(),
  dealId: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
});

export const ImportCsvSchema = z.object({
  kind: z.enum(['contacts','companies']),
  csv: z.string().min(1),
});

export const IngestRunSchema = z.object({
  source: z.string().optional()
});
