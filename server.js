import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Razorpay from 'razorpay';

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

// ---------- Razorpay ----------
let razorpay = null;
function getRazorpay() {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return null;
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

// Create a Razorpay order
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const rp = getRazorpay();
    if (!rp) return res.status(503).json({ error: 'Razorpay is not configured' });

    const { amount, currency, receipt } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: currency || 'INR',
      receipt: receipt || `rcpt_${Date.now()}`,
    };
    const order = await rp.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error('Razorpay create order error:', err);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify Razorpay payment signature
app.post('/api/razorpay/verify', (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ error: 'Razorpay is not configured' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({ verified: true });
    } else {
      res.status(400).json({ verified: false, error: 'Invalid signature' });
    }
  } catch (err) {
    console.error('Razorpay verify error:', err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ---------- Start ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Pudava server running on port ${PORT}`));
