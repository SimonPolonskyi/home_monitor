import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { config } from '../config/config.js';
import { getDB, runMigration } from './database/db.js';
import { runMigrations } from './database/migrations/run-migrations.js';

// Routes
import dataRoutes from './routes/data.js';
import authRoutes from './routes/auth.js';
import devicesRoutes from './routes/devices.js';
import statsRoutes from './routes/stats.js';

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.server.env === 'production',
    httpOnly: true,
    maxAge: config.session.maxAge,
    sameSite: 'strict',
  },
}));

// Routes
app.use('/api/data', dataRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: config.server.env === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

// Initialize database
async function initializeDatabase() {
  try {
    // Створити папку data якщо не існує
    const fs = await import('fs');
    const path = await import('path');
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Запустити міграції
    runMigrations();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  await initializeDatabase();
  
  const PORT = config.server.port;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${config.server.env}`);
    console.log(`CORS origin: ${config.cors.origin}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  const { closeDB } = await import('./database/db.js');
  closeDB();
  process.exit(0);
});

startServer().catch(console.error);
