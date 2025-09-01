CREATE TABLE IF NOT EXISTS users(
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   email TEXT UNIQUE NOT NULL,
   password_sha256 TEXT NOT NULL,
   roles TEXT NOT NULL DEFAULT 'user'
 );
 CREATE TABLE IF NOT EXISTS purchases(
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   user_email TEXT,
   kit_id TEXT,
   status TEXT,
   created_ts TEXT,
   download_token TEXT
 );
 CREATE TABLE IF NOT EXISTS audit_logs(
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   ts TEXT, user_email TEXT, action TEXT, details TEXT
 );
 CREATE TABLE IF NOT EXISTS policies(
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   user_email TEXT, policy_json TEXT
 );
