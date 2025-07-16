const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Firebase Token Verification Middleware
const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

// Save customer endpoint
app.post('/api/customers', verifyFirebaseToken, async (req, res) => {
  const { name, email, phone, address, plan } = req.body;

  if (!name || !email || !phone || !address || !plan) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const uid = req.user.uid;

  try {
    const result = await pool.query(
      `INSERT INTO customers (uid, name, email, phone, address, plan)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (uid) DO UPDATE SET
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         phone = EXCLUDED.phone,
         address = EXCLUDED.address,
         plan = EXCLUDED.plan
       RETURNING *`,
      [uid, name, email, phone, address, plan]
    );

    res.status(201).json({ customer: result.rows[0] });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});