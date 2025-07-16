app.post('/api/customers', verifyFirebaseToken, async (req, res) => {
  console.log('✅ Firebase UID:', req.user?.uid);
  console.log('📥 Body:', req.body);

  const { name, email, phone, address, plan } = req.body;
  const uid = req.user.uid;

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
    console.log('✅ Customer saved:', result.rows[0]);
    res.status(201).json({ customer: result.rows[0] });
  } catch (err) {
    console.error('❌ Error saving customer:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
