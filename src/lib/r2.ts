import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const R2_BUCKET = process.env.R2_BUCKET ?? "";

export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export function guessImageContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

export async function getR2ObjectBytes(key: string): Promise<{
  body: Uint8Array;
  contentType: string;
}> {
  const result = await r2.send(
    new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }),
  );

  if (!result.Body) {
    throw new Error("Objeto vacío en R2");
  }

  const bytes = await result.Body.transformToByteArray();
  return {
    body: bytes,
    contentType:
      result.ContentType ?? guessImageContentType(key),
  };
}
