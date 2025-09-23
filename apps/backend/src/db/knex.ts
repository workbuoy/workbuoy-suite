import knex from 'knex';

const DB_URL = process.env.DB_URL || 'file:workbuoy.db';
export const db = knex({
  client: 'sqlite3',
  connection: { filename: DB_URL.replace(/^file:/,'') },
  useNullAsDefault: true,
  pool: { min: 1, max: 1 }
});
