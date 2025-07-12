// db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use your connection string in environment variable
  ssl: {
    rejectUnauthorized: false // Required for many hosted DBs like Render
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
