import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

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

/**
 * Sube una imagen base64 (data URI) a R2 y devuelve la key generada.
 * Acepta strings como "data:image/png;base64,iVBOR..." o base64 puro.
 */
export async function uploadBase64ToR2(
  base64: string,
  prefix = "",
): Promise<string> {
  let contentType = "image/png";
  let raw = base64;

  const match = base64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (match) {
    contentType = match[1];
    raw = match[2];
  }

  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const ext = extMap[contentType] ?? "png";
  const normalizedPrefix = prefix ? prefix.replace(/\/+$/, "") + "/" : "";
  const key = `${normalizedPrefix}${uuidv4()}.${ext}`;
  const buffer = Buffer.from(raw, "base64");

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read",
    }),
  );

  return key;
}

/**
 * Elimina un objeto de R2 por su key. No lanza error si no existe.
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (!key || key.startsWith("data:")) return;
  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      }),
    );
  } catch (error) {
    console.error("Error al eliminar de R2:", error);
  }
}
