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

// Load environment variables
dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import middleware & routes (to be created)
// import authRoutes from './routes/auth.js';
// import entriesRoutes from './routes/entries.js';
// import adminRoutes from './routes/admin.js';

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

// Disable powered-by header
app.disable('x-powered-by');

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

// TODO: Mount route handlers
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/entries', entriesRoutes);
// app.use('/api/v1/admin', adminRoutes);
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

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   ElementTracker2026 Backend Server    ║
╚════════════════════════════════════════╝

🚀 Server running on http://localhost:${PORT}
📊 Environment: ${NODE_ENV}
🔐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3001'}

Health Check: GET http://localhost:${PORT}/health
API Root: GET http://localhost:${PORT}/api/v1

Ready to accept connections! ✅
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
