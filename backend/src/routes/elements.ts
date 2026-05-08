import express, { Request, Response } from 'express';
import { Pool } from 'pg';

const router = express.Router();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// GET /api/v1/elements - Liste aller vorhandenen Elemente (nicht gelöscht)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, owner_name, description, is_approved, created_at FROM elements WHERE deleted_at IS NULL ORDER BY name'
    );
    return res.json({ success: true, elements: result.rows });
  } catch (error) {
    console.error('Elements GET error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;