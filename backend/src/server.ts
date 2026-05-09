/**
 * ElementTracker2026 - Backend Server
 * Express.js API Server mit JWT Auth
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import middleware & routes
import authRoutes from './routes/auth.js';
import entriesRoutes from './routes/entries.js';
import pendingEntriesRoutes from './routes/pendingEntries.js';
import adminRoutes from './routes/admin.js';
import elementsRoutes from './routes/elements.js';
import uploadsRoutes from './routes/uploads.js';

const app: Express = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet: Security headers
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static file serving for uploads
app.use(express.static(path.join(__dirname, '../public')));

// Disable powered-by header
app.disable('x-powered-by');

const dbPool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function ensureDatabaseSchema() {
  await dbPool.query('CREATE EXTENSION IF NOT EXISTS postgis');

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS elements (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      owner_name VARCHAR(255) NOT NULL,
      description TEXT,
      is_approved BOOLEAN DEFAULT FALSE,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL
    )
  `);

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS pending_entries (
      id BIGSERIAL PRIMARY KEY,
      element_id VARCHAR(50) NOT NULL,
      timestamp TIMESTAMP NOT NULL,
      location_point GEOMETRY(Point, 4326),
      address TEXT,
      location_name VARCHAR(255),
      comment TEXT,
      notification_email VARCHAR(255),
      photo_filename VARCHAR(255),
      photo_size_bytes INT,
      photo_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by_ip INET,
      created_by_user_agent VARCHAR(500),
      approved BOOLEAN DEFAULT FALSE,
      approved_at TIMESTAMP NULL,
      approved_by INT,
      rejected BOOLEAN DEFAULT FALSE,
      rejected_at TIMESTAMP NULL,
      rejected_by INT,
      review_notes TEXT,
      CONSTRAINT fk_pending_element FOREIGN KEY (element_id) REFERENCES elements(id) ON DELETE CASCADE
    )
  `);

  await dbPool.query(`
    CREATE INDEX IF NOT EXISTS idx_pending_entries_element ON pending_entries(element_id);
  `);

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token VARCHAR(500) PRIMARY KEY,
      admin_id INT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      user_agent VARCHAR(500),
      ip_address INET,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      revoked BOOLEAN DEFAULT FALSE,
      revoked_at TIMESTAMP NULL
    )
  `);

  await dbPool.query(`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_admin ON refresh_tokens(admin_id);
  `);
  await dbPool.query(`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
  `);
}

// ============================================
// LOGGING
// ============================================

// Simple request logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '0.1.0',
  });
});

// ============================================
// API ROUTES (To be implemented)
// ============================================

// Mount route handlers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/entries', entriesRoutes);
app.use('/api/v1/pending-entries', pendingEntriesRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/elements', elementsRoutes);
app.use('/api/v1/upload', uploadsRoutes);
// app.use('/api/v1/dsgvo', dsgvoRoutes);

app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    message: 'ElementTracker2026 API v1',
    status: 'operational',
    documentation: 'https://api.elementtracker.local/docs',
  });
});

// ============================================
// 404 ERROR HANDLER
// ============================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

// ============================================
// ERROR HANDLER (Global)
// ============================================

interface CustomError extends Error {
  status?: number;
  code?: string;
}

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  console.error(`[ERROR] ${status} ${message}`, err);

  res.status(status).json({
    success: false,
    error: message,
    code: code,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================
// SERVER START
// ============================================

async function startServer() {
  try {
    await ensureDatabaseSchema();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔════════════════════════════════════════╗
║   ElementTracker2026 Backend Server    ║
╚════════════════════════════════════════╝

🚀 Server running on http://0.0.0.0:${PORT} (accessible at http://10.0.2.15:${PORT})
📊 Environment: ${NODE_ENV}
🔐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3001'}

Health Check: GET http://localhost:${PORT}/health
API Root: GET http://localhost:${PORT}/api/v1

Ready to accept connections! ✅
      `);
    });

    server.on('error', (error: any) => {
      if (error?.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop the existing service or set a free PORT value.`);
        process.exit(1);
      }
      console.error('Server startup error:', error);
      process.exit(1);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to ensure database schema:', error);
    process.exit(1);
  }
}

startServer();

export default app;
