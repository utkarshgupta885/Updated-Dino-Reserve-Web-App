const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './.env' });

const authRoutes = require('./routes/auth.routes');
const unifiedRoutes = require('./routes/unified.routes');
const { dbService } = require('./database');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const connected = await dbService.testConnection();
    res.json({ 
      status: 'ok', 
      message: 'Dino Reserve API is running!',
      database: connected ? 'connected' : 'disconnected',
      mode: process.env.USE_PRISMA === 'true' ? 'Prisma' : 'MySQL'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Health check failed',
      error: error.message 
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', unifiedRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The requested route ${req.method} ${req.path} was not found`
  });
});

app.listen(PORT, async () => {
  console.log(`🦖 Dino Reserve API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Database mode: ${process.env.USE_PRISMA === 'true' ? 'Prisma' : 'MySQL'}`);
  
  // Test database connection and initialize
  const connected = await dbService.testConnection();
  if (connected) {
    await dbService.initializeDatabase();
  }
});

