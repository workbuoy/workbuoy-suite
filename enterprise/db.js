
// lib/db.js
// Driver selector: Postgres in production (or if DATABASE_URL set), SQLite otherwise.
const usePg = process.env.NODE_ENV === 'production' || !!process.env.DATABASE_URL;
if(usePg){
  module.exports = require('./db/postgres');
} else {
  module.exports = require('./db/sqlite');
}
