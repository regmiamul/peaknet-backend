require('dotenv').config();
const express = require('express');
const cors = require('cors');

const customersRoutes = require('./routes/customers');
// Add authRoutes and billingRoutes if you have them
// const authRoutes = require('./routes/authRoutes');
// const billingRoutes = require('./routes/billingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customersRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/billing', billingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
