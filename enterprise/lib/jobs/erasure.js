'use strict';
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const { appendAudit } = require('../secure/audit');

// Simple erasure: mask common PII-like fields in sample tables; record request
async function eraseSubject(subjectId, requestedBy='system'){
  await pool.query('BEGIN');
  try {
    await pool.query('INSERT INTO erasure_requests(subject_id, requested_by) VALUES ($1,$2)', [subjectId, requestedBy]);
    // Example domain tables and fields – adjust to your schema
    const updates = [
      "UPDATE customers SET email='[erased]', name='[erased]' WHERE id=$1 OR email=$1",
      "UPDATE users SET email='[erased]', name='[erased]' WHERE id=$1 OR email=$1"
    ];
    for (const q of updates){
      try { await pool.query(q, [subjectId]); } catch {}
    }
    await appendAudit({ type:'gdpr_erasure', subject_id: subjectId, requested_by: requestedBy });
    await pool.query('COMMIT');
    return true;
  } catch (e){
    await pool.query('ROLLBACK');
    throw e;
  }
}

module.exports = { eraseSubject };
