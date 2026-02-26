import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — no files saved to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

// Helper: upload a buffer to Cloudinary and return the result
function uploadToCloudinary(buffer, mimetype) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'rental/rooms',
        resource_type: 'image',
        format: 'webp',          // auto-convert to WebP for smaller size
        quality: 'auto:good',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// POST /api/upload/room-image
router.post('/room-image', isAuthenticated, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to upload image to Cloudinary' });
  }
});

// DELETE /api/upload/room-image
// Expects body: { publicId: "rental/rooms/abc123" }
router.delete('/room-image', isAuthenticated, async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) {
    return res.status(400).json({ success: false, message: 'publicId is required' });
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    res.status(200).json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete image' });
  }
});

export default router;
