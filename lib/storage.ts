import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export async function uploadImage(
  file: File,
  folder: string
): Promise<string> {
  const extension = file.name.split(".").pop() || "jpg";
  const filename = `${folder}/${crypto.randomUUID()}.${extension}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return `${process.env.S3_PUBLIC_URL}/${filename}`;
}
