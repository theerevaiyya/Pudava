import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

// ---------- AWS S3 ----------
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const BUCKET = process.env.AWS_S3_BUCKET;
const UPLOAD_SECRET = process.env.UPLOAD_API_SECRET;

// Simple auth middleware for upload endpoints
function requireUploadSecret(req, res, next) {
  const token = req.headers['x-upload-secret'];
  if (!UPLOAD_SECRET || token !== UPLOAD_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// Generate a presigned PUT URL so the browser can upload directly to S3
app.post('/api/s3/presign', requireUploadSecret, async (req, res) => {
  try {
    const { key, contentType } = req.body;
    if (!key || !contentType) {
      return res.status(400).json({ error: 'key and contentType are required' });
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const publicUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;

    res.json({ presignedUrl, publicUrl });
  } catch (err) {
    console.error('Presign error:', err);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// Delete an object from S3
app.post('/api/s3/delete', requireUploadSecret, async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ error: 'key is required' });
    }

    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// ---------- Static Files ----------
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ---------- Start ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Pudava server running on port ${PORT}`));
