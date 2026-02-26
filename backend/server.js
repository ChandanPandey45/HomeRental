import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import 'express-async-errors';
import { db } from './config/firebase.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import bookingRoutes from './routes/bookings.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();

// Verify Firebase connection on startup
try {
  await db.collection('_test').doc('_test').set({ test: true });
  console.log('✓ Firebase Firestore connected successfully');
} catch (error) {
  console.error('✗ Firebase Firestore connection failed:', error.message);
  process.exit(1);
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Allow Vite dev server during local development
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    database: 'Firebase Firestore'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/upload', uploadRoutes);

// ── Serve React frontend build ──
const frontendBuild = path.join(__dirname, 'public');
app.use(express.static(frontendBuild));

// Catch-all: return React's index.html for any non-API route
// This lets React Router handle /login, /room/:id, etc.
app.get('*', (req, res) => {
  const indexPath = path.join(frontendBuild, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // If build doesn't exist yet, fall through with a helpful message
      res.status(404).json({
        success: false,
        message: 'Frontend not built yet. Run: cd frontend && npm run build'
      });
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend served at: http://localhost:${PORT}`);
});

export default app;

