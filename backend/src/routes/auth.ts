import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const jwtSecret = process.env.JWT_SECRET;
const refreshTokenSecret = (process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET) as string | undefined;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

if (!jwtSecret) {
  throw new Error('Missing required environment variable JWT_SECRET');
}

if (!refreshTokenSecret) {
  throw new Error('Missing required environment variable REFRESH_TOKEN_SECRET');
}

if (!process.env.REFRESH_TOKEN_SECRET) {
  console.warn('REFRESH_TOKEN_SECRET is not set. Falling back to JWT_SECRET for refresh tokens. Set REFRESH_TOKEN_SECRET for production.');
}

const parseDurationToSeconds = (value: string): number => {
  if (/^\d+$/.test(value)) {
    return parseInt(value, 10);
  }
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 86400;
  }
  const amount = parseInt(match[1], 10);
  const unit = match[2];

  if (unit === 's') return amount;
  if (unit === 'm') return amount * 60;
  if (unit === 'h') return amount * 3600;
  if (unit === 'd') return amount * 86400;
  return 86400;
};

const accessTokenExpiresInSeconds = parseDurationToSeconds(jwtExpiresIn);
const refreshTokenExpiresInSeconds = parseDurationToSeconds(refreshTokenExpiresIn);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const generateAccessToken = (admin: { id: number; username: string }): string => {
  return (jwt.sign as any)({ id: admin.id, username: admin.username }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
};

const generateRefreshToken = (admin: { id: number; username: string }): string => {
  return (jwt.sign as any)({ id: admin.id, username: admin.username }, refreshTokenSecret, {
    expiresIn: refreshTokenExpiresIn,
  });
};

const saveRefreshToken = async (
  refreshToken: string,
  adminId: number,
  userAgent: string | null,
  ipAddress: string | null
) => {
  const expiresAt = new Date(Date.now() + refreshTokenExpiresInSeconds * 1000);
  await pool.query(
    `INSERT INTO refresh_tokens (token, admin_id, user_agent, ip_address, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (token) DO UPDATE SET revoked = false, expires_at = $5, user_agent = $3, ip_address = $4`,
    [refreshToken, adminId, userAgent, ipAddress, expiresAt]
  );
};

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required',
      });
    }

    const result = await pool.query(
      'SELECT id, username, password_hash, email FROM admins WHERE username = $1 AND is_active = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const admin = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const token = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);
    await saveRefreshToken(refreshToken, admin.id, req.headers['user-agent'] || null, req.ip || null);

    await pool.query('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [admin.id]);

    res.json({
      success: true,
      token,
      refreshToken,
      expiresIn: accessTokenExpiresInSeconds,
      refreshExpiresIn: refreshTokenExpiresInSeconds,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token is required' });
    }

    let payload: { id: number; username: string };
    try {
      payload = jwt.verify(refreshToken, refreshTokenSecret as string) as unknown as { id: number; username: string };
    } catch (error: any) {
      console.error('Refresh token verification failed:', error);
      return res.status(401).json({
        success: false,
        error: error?.name === 'TokenExpiredError' ? 'Refresh token expired' : 'Invalid refresh token',
      });
    }

    const tokenRow = await pool.query('SELECT token, admin_id, revoked, expires_at FROM refresh_tokens WHERE token = $1', [refreshToken]);
    if (tokenRow.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Refresh token not found' });
    }

    const storedToken = tokenRow.rows[0];
    if (storedToken.revoked || new Date(storedToken.expires_at) <= new Date()) {
      return res.status(401).json({ success: false, error: 'Refresh token is no longer valid' });
    }

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await pool.query('UPDATE refresh_tokens SET revoked = true, revoked_at = CURRENT_TIMESTAMP WHERE token = $1', [refreshToken]);
    await saveRefreshToken(newRefreshToken, payload.id, req.headers['user-agent'] || null, req.ip || null);

    res.json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: accessTokenExpiresInSeconds,
      refreshExpiresIn: refreshTokenExpiresInSeconds,
    });
  } catch (error) {
    console.error('Refresh endpoint error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token is required to logout' });
    }

    await pool.query('UPDATE refresh_tokens SET revoked = true, revoked_at = CURRENT_TIMESTAMP WHERE token = $1', [refreshToken]);
    res.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
