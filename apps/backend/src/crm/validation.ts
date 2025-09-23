import { z } from 'zod';

export const ContactCreate = z.object({
  id: z.string().uuid().optional(),
  tenant_id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  organization_id: z.string().optional(),
  owner_id: z.string().optional(),
  tags: z.array(z.string()).optional(),
  custom_fields: z.record(z.any()).optional(),
});

export const PipelineCreate = z.object({
  id: z.string().uuid().optional(),
  tenant_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  owner_id: z.string().optional(),
  tags: z.array(z.string()).optional(),
  custom_fields: z.record(z.any()).optional(),
});

export const OpportunityCreate = z.object({
  id: z.string().uuid().optional(),
  tenant_id: z.string(),
  pipeline_id: z.string(),
  stage_id: z.string(),
  organization_id: z.string().optional(),
  title: z.string(),
  value_cents: z.number().int().optional(),
  currency: z.string().optional(),
  status: z.enum(['open', 'won', 'lost']).optional(),
  owner_id: z.string().optional(),
  tags: z.array(z.string()).optional(),
  custom_fields: z.record(z.any()).optional(),
});
