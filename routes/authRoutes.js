const express = require('express');
const router = express.Router();
const { saveUser } = require('../controllers/authController');
const verifyToken = require('../utils/verifyFirebaseToken');

router.post('/signup', verifyToken, saveUser);

module.exports = router;
