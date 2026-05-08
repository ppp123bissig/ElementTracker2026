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

// POST /api/v1/pending-entries
// Existing elements are stored immediately without admin approval.
// Only completely new element IDs are created as pending entries for admin review.
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      element_id,
      timestamp,
      latitude,
      longitude,
      address,
      location_name,
      comment,
      notification_email,
      photo_url,
    } = req.body;

    if (!element_id || !timestamp || latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        error: 'element_id, timestamp, latitude and longitude are required',
      });
    }

    const elementResult = await pool.query(
      'SELECT id FROM elements WHERE id = $1',
      [element_id]
    );

    if (elementResult.rows.length > 0) {
      const insertSql = `
        INSERT INTO entries (
          element_id,
          timestamp,
          location_point,
          address,
          location_name,
          comment,
          notification_email,
          photo_url,
          created_at
        ) VALUES (
          $1,
          $2,
          ST_SetSRID(ST_MakePoint($3, $4), 4326),
          $5,
          $6,
          $7,
          $8,
          $9,
          CURRENT_TIMESTAMP
        )
        RETURNING
          id,
          element_id,
          timestamp,
          ST_X(location_point::geometry) AS longitude,
          ST_Y(location_point::geometry) AS latitude,
          address,
          location_name,
          comment,
          notification_email,
          photo_url,
          created_at
      `;

      const result = await pool.query(insertSql, [
        element_id,
        timestamp,
        longitude,
        latitude,
        address || null,
        location_name || null,
        comment || null,
        notification_email || null,
        photo_url || null,
      ]);

      return res.status(201).json({ success: true, entry: result.rows[0], message: 'Eintrag wurde direkt gespeichert.' });
    }

    await pool.query(
      `INSERT INTO elements (id, name, owner_name, description, is_approved)
       VALUES ($1, $2, $3, $4, false)`,
      [
        element_id,
        element_id,
        'Unbekannter Eigentümer',
        'Automatisch angelegtes Element',
      ]
    );

    const insertPendingSql = `
      INSERT INTO pending_entries (
        element_id,
        timestamp,
        location_point,
        address,
        location_name,
        comment,
        notification_email,
        photo_url,
        created_by_ip,
        created_by_user_agent
      ) VALUES (
        $1,
        $2,
        ST_SetSRID(ST_MakePoint($3, $4), 4326),
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11
      )
      RETURNING
        id,
        element_id,
        timestamp,
        ST_X(location_point::geometry) AS longitude,
        ST_Y(location_point::geometry) AS latitude,
        address,
        location_name,
        comment,
        notification_email,
        photo_url,
        created_at
    `;

    try {
      const result = await pool.query(insertPendingSql, [
        element_id,
        timestamp,
        longitude,
        latitude,
        address || null,
        location_name || null,
        comment || null,
        notification_email || null,
        photo_url || null,
        req.ip || null,
        req.headers['user-agent'] || null,
      ]);

      return res.status(201).json({ success: true, pending_entry: result.rows[0], message: 'Neues Element wurde angelegt und wartet auf Freigabe.' });
    } catch (queryError) {
      console.error('Query error:', queryError);
      console.error('Query values:', {
        element_id,
        timestamp,
        longitude,
        latitude,
      });
      throw queryError;
    }
  } catch (error) {
    console.error('Pending entry POST error:', error instanceof Error ? error.message : error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

export default router;
