const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../utils/verifyFirebaseToken');
const db = require('../db');

router.post('/', verifyFirebaseToken, async (req, res) => {
  const { name, email, phone, address, plan } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO customers (name, email, phone, address, plan)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email, phone, address, plan]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Database insert error:', err);
    res.status(500).json({ error: 'Failed to save customer' });
  }
});

module.exports = router;
