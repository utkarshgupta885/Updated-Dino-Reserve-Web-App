const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
console.log('ENV CHECK:', process.env.DB_PASSWORD);

// Load environment variables
dotenv.config({ path: './.env' });

const authRoutes = require('./routes/auth.routes');
const reservationRoutes = require('./routes/reservation.routes');
const { testConnection, initializeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dino Reserve API is running!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', reservationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`🦖 Dino Reserve API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  
  // Test database connection and initialize
  const connected = await testConnection();
  if (connected) {
    await initializeDatabase();
  }
});

