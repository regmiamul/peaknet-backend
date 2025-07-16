// app.js
const express = require('express');
const cors = require('cors');
const db = require('./db'); // PostgreSQL
const verifyFirebaseToken = require('./middleware/firebaseAuth'); // Add this line

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// ✅ Route to add new customer, now with Firebase token verification
app.post('/api/customers', verifyFirebaseToken, async (req, res) => {
  const { name, email, phone, address, plan } = req.body;
  const uid = req.user.uid; // ✅ Use uid from decoded Firebase token

  if (!uid || !name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await db.query(
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
    console.error('❌ Error saving customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
