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

// GET /api/v1/entries - Liste aller Einträge oder nach element_id gefiltert
router.get('/', async (req: Request, res: Response) => {
  try {
    const { element_id } = req.query;
    const baseSql = `SELECT id, element_id, timestamp, ST_X(location_point::geometry) AS longitude, ST_Y(location_point::geometry) AS latitude, address, comment, photo_url, created_at FROM entries WHERE deleted_at IS NULL`;

    let result;
    if (element_id) {
      result = await pool.query(`${baseSql} AND element_id = $1 ORDER BY timestamp DESC`, [element_id]);
    } else {
      result = await pool.query(`${baseSql} ORDER BY timestamp DESC`);
    }

    return res.json({ success: true, entries: result.rows });
  } catch (error) {
    console.error('Entries GET error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/v1/entries - Eintrag erstellen
router.post('/', async (req: Request, res: Response) => {
  try {
    const { element_id, timestamp, latitude, longitude, address, comment, photo_url } = req.body;

    if (!element_id || !timestamp || latitude == null || longitude == null) {
      return res.status(400).json({ success: false, error: 'element_id, timestamp, latitude and longitude are required' });
    }

    const elementResult = await pool.query('SELECT id FROM elements WHERE id = $1', [element_id]);
    if (elementResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Element does not exist. Use /api/v1/pending-entries to submit a new element for approval.',
      });
    }

    const insertSql = `
      INSERT INTO entries (element_id, timestamp, location_point, address, comment, photo_url)
      VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6, $7)
      RETURNING id, element_id, timestamp, ST_X(location_point::geometry) AS longitude, ST_Y(location_point::geometry) AS latitude, address, comment, photo_url, created_at
    `;

    try {
      const result = await pool.query(insertSql, [element_id, timestamp, longitude, latitude, address || null, comment || null, photo_url || null]);
      return res.status(201).json({ success: true, entry: result.rows[0] });
    } catch (queryError) {
      console.error('Query error:', queryError);
      console.error('Query values:', { element_id, timestamp, longitude, latitude });
      throw queryError;
    }
  } catch (error) {
    console.error('Entries POST error:', error instanceof Error ? error.message : error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

// GET /api/v1/elements - Liste aller Elemente
router.get('/elements', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT id, name, owner_name, description, is_approved, created_by, created_at FROM elements ORDER BY created_at DESC`);
    return res.json({ success: true, elements: result.rows });
  } catch (error) {
    console.error('Elements GET error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
