require('dotenv').config();

const cors = require('cors');
const express = require('express');
const connectDatabase = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminApplicationRoutes = require('./routes/adminApplicationRoutes');

const app = express();
const port = process.env.PORT || 5000;
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5500';

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or local files)
    if (!origin) {
      return callback(null, true);
    }

    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const allowedOrigins = [frontendOrigin, 'http://localhost:5500', 'http://127.0.0.1:5500'];

    if (isLocalhost || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-wallet-address']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin/applications', adminApplicationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
}

startServer();
