const pool = require('../models/db');

const saveUser = async (req, res) => {
  const { name, email, address } = req.body;
  const uid = req.user.uid;

  try {
    await pool.query(
      'INSERT INTO customers (uid, name, email, address) VALUES ($1, $2, $3, $4) ON CONFLICT (uid) DO NOTHING',
      [uid, name, email, address]
    );
    res.status(200).json({ message: 'User saved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'DB error' });
  }
};

module.exports = { saveUser };
