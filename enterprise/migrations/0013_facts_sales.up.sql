CREATE TABLE IF NOT EXISTS facts_sales(
  date TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  ytd REAL, ly_ytd REAL,
  qtd REAL, lq_qtd REAL,
  mtd REAL, lm_mtd REAL,
  target REAL,
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY(date, customer_id, product_id)
);
