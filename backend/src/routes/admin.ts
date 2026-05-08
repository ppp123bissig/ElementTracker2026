import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

interface AuthRequest extends Request {
  admin?: {
    id: number;
    username: string;
  };
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('Missing required environment variable JWT_SECRET');
}

const verifyAdminToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization token is required' });
  }

  const token = authHeader.slice(7);
  try {
    console.log('Admin route: Verifying token. Secret length:', jwtSecret.length);
    const payload = jwt.verify(token, jwtSecret) as { id: number; username: string };
    req.admin = payload;
    next();
  } catch (error: any) {
    console.error('Admin authorization failed:', error.message);
    if (error && typeof error === 'object' && (error as any).name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
};

router.use(verifyAdminToken);

router.get('/pending-entries', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT
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
       FROM pending_entries
       WHERE approved = false AND rejected = false
       ORDER BY created_at DESC`
    );

    return res.json({ success: true, pending_entries: result.rows });
  } catch (error) {
    console.error('Admin pending entries GET error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.patch('/pending-entries/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const pendingEntryId = req.params.id;
    const adminId = req.admin?.id;

    if (!adminId) {
      return res.status(403).json({ success: false, error: 'Admin account required' });
    }

    const pendingResult = await pool.query(
      `SELECT
         element_id,
         timestamp,
         location_point,
         address,
         location_name,
         comment,
         notification_email,
         photo_url
       FROM pending_entries
       WHERE id = $1 AND approved = false AND rejected = false`,
      [pendingEntryId]
    );

    if (pendingResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Pending entry not found or already reviewed' });
    }

    const pendingEntry = pendingResult.rows[0];

    await pool.query('BEGIN');

    const insertResult = await pool.query(
      `INSERT INTO entries (
         element_id,
         timestamp,
         location_point,
         address,
         location_name,
         comment,
         notification_email,
         photo_url,
         created_at,
         updated_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, $9)
       RETURNING id, element_id, timestamp, ST_X(location_point::geometry) AS longitude, ST_Y(location_point::geometry) AS latitude, address, location_name, comment, notification_email, photo_url, created_at`,
      [
        pendingEntry.element_id,
        pendingEntry.timestamp,
        pendingEntry.location_point,
        pendingEntry.address,
        pendingEntry.location_name,
        pendingEntry.comment,
        pendingEntry.notification_email,
        pendingEntry.photo_url,
        adminId,
      ]
    );

    await pool.query(
      `UPDATE pending_entries
       SET approved = true,
           approved_at = CURRENT_TIMESTAMP,
           approved_by = $1
       WHERE id = $2`,
      [adminId, pendingEntryId]
    );

    // Also approve the element itself so it appears in the dropdown
    await pool.query(
      `UPDATE elements
       SET is_approved = true
       WHERE id = $1`,
      [pendingEntry.element_id]
    );

    await pool.query('COMMIT');

    return res.json({ success: true, entry: insertResult.rows[0] });
  } catch (error) {
    await pool.query('ROLLBACK').catch(() => null);
    console.error('Admin approve pending entry error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.patch('/pending-entries/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const pendingEntryId = req.params.id;
    const adminId = req.admin?.id;
    const { reason } = req.body;

    if (!adminId) {
      return res.status(403).json({ success: false, error: 'Admin account required' });
    }

    const updateResult = await pool.query(
      `UPDATE pending_entries
       SET rejected = true,
           rejected_at = CURRENT_TIMESTAMP,
           rejected_by = $1,
           review_notes = $2
       WHERE id = $3
         AND approved = false
         AND rejected = false
       RETURNING id`,
      [adminId, reason || null, pendingEntryId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Pending entry not found or already reviewed' });
    }

    return res.json({ success: true, rejected_id: updateResult.rows[0].id });
  } catch (error) {
    console.error('Admin reject pending entry error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /api/v1/admin/entries/:id - Eintrag bearbeiten
router.patch('/entries/:id', async (req: AuthRequest, res: Response) => {
  try {
    const entryId = req.params.id;
    const adminId = req.admin?.id;
    const {
      latitude,
      longitude,
      address,
      location_name,
      comment,
      notification_email,
      photo_url,
    } = req.body;

    if (!adminId) {
      return res.status(403).json({ success: false, error: 'Admin account required' });
    }

    const updateFields: string[] = [];
    const values: any[] = [];

    if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null) {
      values.push(longitude, latitude);
      updateFields.push(`location_point = ST_SetSRID(ST_MakePoint($${values.length - 1}, $${values.length}), 4326)`);
    }
    if (address !== undefined) {
      values.push(address);
      updateFields.push(`address = $${values.length}`);
    }
    if (location_name !== undefined) {
      values.push(location_name);
      updateFields.push(`location_name = $${values.length}`);
    }
    if (comment !== undefined) {
      values.push(comment);
      updateFields.push(`comment = $${values.length}`);
    }
    if (notification_email !== undefined) {
      values.push(notification_email);
      updateFields.push(`notification_email = $${values.length}`);
    }
    if (photo_url !== undefined) {
      values.push(photo_url);
      updateFields.push(`photo_url = $${values.length}`);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    values.push(adminId);
    values.push(entryId);

    const updateSql = `
      UPDATE entries
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP, updated_by = $${values.length - 1}
      WHERE id = $${values.length}
      RETURNING id, element_id, timestamp, ST_X(location_point::geometry) AS longitude, ST_Y(location_point::geometry) AS latitude, address, location_name, comment, notification_email, photo_url, created_at
    `;

    const updateResult = await pool.query(updateSql, values);
    if (updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Entry not found' });
    }

    return res.json({ success: true, entry: updateResult.rows[0] });
  } catch (error) {
    console.error('Admin update entry error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/v1/admin/entries/delete - Eintrag löschen (softdelete)
router.delete('/entries/delete', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.body;
    const adminId = req.admin?.id;

    if (!adminId) {
      return res.status(403).json({ success: false, error: 'Admin account required' });
    }

    if (!id) {
      return res.status(400).json({ success: false, error: 'Entry id is required' });
    }

    // Check if entry exists
    const checkResult = await pool.query('SELECT id FROM entries WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Entry not found' });
    }

    // Softdelete: Set deleted_at
    const deleteResult = await pool.query(
      `UPDATE entries
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    return res.json({ success: true, deleted_id: deleteResult.rows[0].id });
  } catch (error) {
    console.error('Admin delete entry error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /api/v1/admin/elements/delete - Element löschen (softdelete)
router.delete('/elements/delete', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.body;
    const adminId = req.admin?.id;

    if (!adminId) {
      return res.status(403).json({ success: false, error: 'Admin account required' });
    }

    if (!id) {
      return res.status(400).json({ success: false, error: 'Element id is required' });
    }

    // Check if element exists
    const checkResult = await pool.query('SELECT id FROM elements WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Element not found' });
    }

    // Softdelete: Set deleted_at
    const deleteResult = await pool.query(
      `UPDATE elements
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    return res.json({ success: true, deleted_id: deleteResult.rows[0].id });
  } catch (error) {
    console.error('Admin delete element error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
