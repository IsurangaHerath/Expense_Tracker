const { Pool } = require('pg');
const path = require('path');

// Connection is taken from DATABASE_URL (e.g. the Neon connection string)
// when present, otherwise it falls back to the local Postgres defaults.
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool();

// Converts sqlite-style positional placeholders (?) to Postgres ones ($1, $2, ...)
function toPg(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

const db = {
  // Returns a single row (or null)
  async get(sql, params = []) {
    const result = await pool.query(toPg(sql), params);
    return result.rows[0] ?? null;
  },

  // Returns all rows (or [])
  async all(sql, params = []) {
    const result = await pool.query(toPg(sql), params);
    return result.rows;
  },

  // Runs an INSERT/UPDATE/DELETE and reports the affected row count and created id
  async run(sql, params = []) {
    const result = await pool.query(toPg(sql), params);
    return {
      lastID: result.rows[0]?.id ?? null,
      changes: result.rowCount
    };
  },

  // Raw query access for any custom needs
  query: (text, params) => pool.query(text, params),

  end: () => pool.end()
};

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(20) NOT NULL DEFAULT '#4F46E5',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        category_id BIGINT,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id)
  `);

  const row = await db.get(`SELECT COUNT(*) AS count FROM categories`);
  if (row && Number(row.count) === 0) {
    const defaultCategories = [
      ['Food', '#FF6B6B'],
      ['Transport', '#4ECDC4'],
      ['Bills', '#FFE66D'],
      ['Entertainment', '#FF9F1C'],
      ['Shopping', '#9B5DE5'],
      ['Health', '#00F5D4']
    ];

    const insert = `
      INSERT INTO categories (name, color) VALUES ($1, $2)
    `;

    for (const [name, color] of defaultCategories) {
      await pool.query(insert, [name, color]);
    }

    console.log('Seeded default categories.');
  }

  console.log('Connected to the Postgres database.');
}

const ready = init();

ready.catch((err) => {
  console.error('Database init error:', err.message);
  process.exit(1);
});

// Resolves after tables exist and categories are seeded
db.ready = ready;

module.exports = db;