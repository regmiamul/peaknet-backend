const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert({
  "project_id": "peaknet-8910d",
 
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCQx6EmXoManhx8\nZ6IC2822k7uODtL5zFnP+aJ4vqVDcDbUrDyoID3fezEgYqFpI2ff8AruiZT+GRnz\nAdjZiu/XM7dpp1AUvqFfqJfCgqVTIyXkY2sd4ZcFnkKZFPvG40ePvgjA9TKTfPaF\napRC2Syb1Eu9ojBQ2XW3jTmkVxjXNdQhFs8ZFKt/txn7pgRPv7vX7MgzPkSYp2b7\nJ9CieJWyW4peIoamV5jpq+QEor6l2UfOFXr3a3snKWn0/dJCW56MrCe8EOm6eaN0\nS4XAyXMTJd+RHmEondidIv/Jpmjy0B9pj/jog1Xi/taKfYrn3F63lbHvUrw5yBvt\n15rBRdv7AgMBAAECggEAHMGZ734MOkg3TjpjQoAX/vCe6xtkqjr9h8KEk8kCGD/8\nlAdV0Or+fxn/6vfMKY7fven2seRf1Ix1y/+M68Cd3Len8XNLA6PNd6uL4RWD8txj\nVVat2vSIw5PolHFHhPx1pUZQhMru7b5/VIaTxidOpfDnzlWdlSFsMTX6wfqOs4fw\nAME/WUhiq0GIoQ+KYlZJwG9quxG7BwdOgF8GqmNcYbb0xhabfY49rBvrIAwjZCFH\nk9vlIGe3KbHHsRa5FMsBG4eLWPlWCelZwirhGttF1NEH2hyNhXPFo92YOp5xMZYb\nYQDwlVvR36frCTvO6IkbJ/54GxXFm6xrsJ3UKI6IQQKBgQDHdiJTv4qZVPMVptAP\nIb3o3Cdp50DeYYk28h7WXYAGAQptsxhHFEEGnb6/blgMSQDy1/H3uZSJCdh82UtF\nQ07R7wDQyRMYSLjTqvKawi3p5Jof6cseFl65rhw+9ys8GdM4gVEYkt0jYiXCu93u\njPGj/MQdD7K8BD/Pfw1ZrDKMGwKBgQC50Yky1CBdLrb153JljpigNbSW6Epzea7J\nIFlpyl5wUqywj1yUuUn5t1962GzjZ+d2E8lhhvGGGPiOfqvXU2sBE2uGI4jrcE9S\ngAmT22qmnvZ8WgwYiEeYZtSkEMCF9NRy0CrdJIinSziktSN9+7DlYnbMcL9G173s\nFd4BAEEtoQKBgHftyvQKDh7lmgdhtmXyxso1XSlrF3Deum8kI3CG5Yw2ofuVnLpY\nLkT5IhDeGujAGGbrepyVo/7FwbpHuN9beg/2IcpnrCiEyUTT22075fllL1qS60Ma\n9je0vV0Kpp9Lc9ncv1MEMxysTcIJzYY6jqwoNg63OqOb9nYfkXpidD4TAoGAGSNR\nrkCoSDLjqYywGzEZUMMzNR8jw09459iqf/dSo1tr5U7ftXcDnPbDwfi5cmJCG+U9\nXyZEUmHablyQnsa4OSMJbtIr2b4N3RlZMlmCqhvjOJtt+3ukQ+fVaISjpvuiKg4j\nXlts6UTx2sZukMKWAdI6RBoUpl7VYLTsnbINH0ECgYBAOpWV5DmFXVoZf+pMfIUc\nsN/ouBsRLbTVqjLc9I2/C5o36Oa/GUrbLmz2oun3NGW96/c+DoP80rzKaWCkdyDe\nV63WyFVnWlk3DnpDEv9qvrDZoWEHdI3YOGujmv616oRBqJabEgwt4TyaZfFmT2zx\nFoc8BiYaqW912KIceOscjg==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@peaknet-8910d.iam.gserviceaccount.com",
  }),
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