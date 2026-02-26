import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount;

// Prefer a local serviceAccountKey.json file if present (safer during local development).
const saPath = path.join(__dirname, '../serviceAccountKey.json');
if (fs.existsSync(saPath)) {
  try {
    serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
  } catch (err) {
    console.error('Error parsing serviceAccountKey.json:', err.message || err);
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  try {
    const decoded = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      'base64'
    ).toString('utf8');

    serviceAccount = JSON.parse(decoded);
  } catch (error) {
    console.error(
      'Error decoding FIREBASE_SERVICE_ACCOUNT_BASE64:',
      error
    );
  }
}

if (!serviceAccount) {
  throw new Error(
    'Firebase service account key not found. Please either:\n' +
    '1. Place serviceAccountKey.json in the backend/ folder, OR\n' +
    '2. Set FIREBASE_SERVICE_ACCOUNT_JSON environment variable with the service account JSON'
  );
}

if (!serviceAccount.project_id || typeof serviceAccount.project_id !== 'string') {
  throw new Error('Firebase service account is missing a valid "project_id" property. Please use a proper service account JSON.');
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
});

// Get Firestore and Auth instances
export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

// Note: Firestore Admin SDK does not support client-side network/persistence
// controls like `enableNetwork()`. No-op on server.

export default admin;
