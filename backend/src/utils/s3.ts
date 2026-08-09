import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ENV } from '../config/env';

// Local storage directory initialization for offline fallback
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (PNG, JPG, JPEG, WEBP) are allowed'));
    }
  },
});

export const uploadToS3OrLocal = async (file: Express.Multer.File): Promise<string> => {
  const awsKey = process.env.AWS_ACCESS_KEY_ID;
  const awsSecret = process.env.AWS_SECRET_ACCESS_KEY;
  const awsRegion = process.env.AWS_REGION || 'us-east-1';
  const bucketName = process.env.AWS_S3_BUCKET_NAME;

  const fileExtension = path.extname(file.originalname) || '.png';
  const fileName = `products/${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;

  if (awsKey && awsSecret && bucketName) {
    try {
      const s3Client = new S3Client({
        region: awsRegion,
        credentials: {
          accessKeyId: awsKey,
          secretAccessKey: awsSecret,
        },
      });

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      const s3Url = `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${fileName}`;
      console.log(`☁️ Uploaded image to AWS S3: ${s3Url}`);
      return s3Url;
    } catch (err: any) {
      console.warn(`⚠️ AWS S3 upload notice (${err.message}). Using local upload fallback.`);
    }
  }

  // Local storage fallback
  const localFilePath = path.join(uploadDir, path.basename(fileName));
  fs.writeFileSync(localFilePath, file.buffer);
  const localUrl = `http://localhost:${ENV.PORT}/uploads/${path.basename(fileName)}`;
  console.log(`📁 Saved image locally: ${localUrl}`);
  return localUrl;
};
