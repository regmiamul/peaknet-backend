// db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Your PostgreSQL connection string
  ssl: {
    rejectUnauthorized: false, // Required for some hosted DBs like Render
  },
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
