import { db } from './knex.js';

async function ensureTable(name: string, builder: (t:any)=>void) {
  const exists = await db.schema.hasTable(name);
  if (!exists) { await db.schema.createTable(name, builder as any); }
}

async function run() {
  // pipelines
  await ensureTable('pipelines', t=>{
    t.string('id').primary();
    t.string('tenant_id').notNullable().index();
    t.string('name').notNullable();
    t.integer('created_at').notNullable();
    t.integer('updated_at').notNullable();
  });
  await ensureTable('stages', t=>{
    t.string('id').primary();
    t.string('tenant_id').notNullable().index();
    t.string('pipeline_id').notNullable().index();
    t.string('name').notNullable();
    t.integer('order').notNullable();
    t.integer('created_at').notNullable();
    t.integer('updated_at').notNullable();
  });

  // contacts
  await ensureTable('contacts', t=>{
    t.string('id').primary();
    t.string('tenant_id').notNullable().index();
    t.string('name').notNullable();
    t.string('email');
    t.string('phone');
    t.string('organization_id');
    t.string('owner_id');
    t.text('custom_fields'); // JSON string
    t.integer('created_at').notNullable();
    t.integer('updated_at').notNullable();
  });

  // opportunities
  await ensureTable('opportunities', t=>{
    t.string('id').primary();
    t.string('tenant_id').notNullable().index();
    t.string('title').notNullable();
    t.float('amount');
    t.string('stage_id');
    t.string('contact_id');
    t.string('organization_id');
    t.string('owner_id');
    t.text('custom_fields');
    t.integer('created_at').notNullable();
    t.integer('updated_at').notNullable();
  });
}

run().then(()=>db.destroy()).catch(e=>{ console.error(e); db.destroy(); process.exit(1); });
