import express, { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { mkdir } from 'fs/promises';

const router = express.Router();

// POST /api/v1/upload - Upload a photo
router.post('/', async (req: Request, res: Response) => {
  try {
    // Check if we have formdata or raw buffer
    const contentType = req.headers['content-type'];
    
    // Try to get the file from FormData (Express doesn't parse FormData by default)
    // For now, we'll accept base64-encoded images
    if (typeof req.body === 'object' && req.body.photo) {
      // Base64 encoded photo from FormData converted to JSON
      const photoData = req.body.photo; // Should be base64 string
      const timestamp = Date.now();
      const filename = `photo_${timestamp}.jpg`;
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        console.error('Failed to create uploads directory:', error);
      }

      const filePath = path.join(uploadsDir, filename);
      
      // Decode and save if it's base64
      if (typeof photoData === 'string' && photoData.startsWith('data:')) {
        const base64Data = photoData.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      } else if (typeof photoData === 'string') {
        fs.writeFileSync(filePath, Buffer.from(photoData, 'base64'));
      } else {
        throw new Error('Invalid photo data format');
      }

      const url = `/uploads/${filename}`;
      
      return res.json({
        success: true,
        url: url,
        message: 'Photo uploaded successfully',
      });
    }

    // Alternative: Try to parse raw binary data
    if (Buffer.isBuffer(req.body)) {
      const timestamp = Date.now();
      const filename = `photo_${timestamp}.jpg`;
      
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        console.error('Failed to create uploads directory:', error);
      }

      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, req.body);

      const url = `/uploads/${filename}`;
      
      return res.json({
        success: true,
        url: url,
        message: 'Photo uploaded successfully',
      });
    }

    return res.status(400).json({
      success: false,
      error: 'No photo data provided. Send as base64 string or binary data.',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload photo',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
