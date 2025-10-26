import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const endpoint = process.env.MINIO_ENDPOINT ?? "localhost";
const port = process.env.MINIO_PORT ?? "9000";

export const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: `http://${endpoint}:${port}`,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY ?? "admin",
    secretAccessKey: process.env.MINIO_SECRET_KEY ?? "admin123"
  }
});

export async function createUpload(orgId: string, fileName: string, contentType: string) {
  const key = `${orgId}/raw/${Date.now()}-${fileName}`;
  const presign = await createPresignedPost(s3Client, {
    Bucket: process.env.S3_BUCKET ?? "brandos",
    Key: key,
    Conditions: [["starts-with", "$Content-Type", ""]],
    Fields: { "Content-Type": contentType }
  });
  return { key, ...presign };
}

export async function putObject(key: string, body: Buffer, contentType: string) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET ?? "brandos",
      Key: key,
      Body: body,
      ContentType: contentType
    })
  );
}
