/**
 * Cliente de DigitalOcean Spaces (S3-compatible).
 *
 * Subimos imágenes que el estudiante captura desde el composer del diario:
 * fotos del negocio, del producto, etc. La URL pública resultante se
 * incrusta en una entry de tipo "answer" y también se manda a Claude
 * Haiku 4.5 (multimodal) como image content block.
 *
 * Bucket: `maluwa-uploads` con permiso de lectura pública por objeto
 * (gracias al ACL `public-read` que pasamos en cada PutObject). El
 * bucket en sí no es listable.
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomBytes } from "node:crypto";

let cached: S3Client | null = null;

function getClient(): S3Client {
  if (cached) return cached;
  const endpoint = process.env.DO_SPACES_ENDPOINT;
  const region = process.env.DO_SPACES_REGION;
  const accessKeyId = process.env.DO_SPACES_KEY;
  const secretAccessKey = process.env.DO_SPACES_SECRET;
  if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Faltan variables DO_SPACES_*. Setear en .env.local (dev) y en App Platform (prod).",
    );
  }
  cached = new S3Client({
    endpoint,
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
  return cached;
}

const ACCEPTED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface UploadInput {
  buffer: Buffer;
  mime: string;
  originalName?: string;
  prefix?: string; // ej. "journals/<id>/"
}

export interface UploadResult {
  key: string;
  url: string;
  publicUrl: string;
  size: number;
  mime: string;
}

export function validateImage(input: { mime: string; size: number }): {
  ok: boolean;
  error?: string;
} {
  if (!ACCEPTED_MIME.has(input.mime)) {
    return { ok: false, error: "tipo de imagen no soportado (jpeg/png/webp/gif)" };
  }
  if (input.size > MAX_SIZE_BYTES) {
    return { ok: false, error: "imagen muy grande (máximo 5 MB)" };
  }
  return { ok: true };
}

export async function uploadImage(input: UploadInput): Promise<UploadResult> {
  const v = validateImage({ mime: input.mime, size: input.buffer.length });
  if (!v.ok) throw new Error(v.error);

  const ext = mimeToExt(input.mime);
  const id = randomBytes(8).toString("hex");
  const key = `${input.prefix ?? "uploads/"}${Date.now()}-${id}${ext}`;
  const bucket = process.env.DO_SPACES_BUCKET!;
  const region = process.env.DO_SPACES_REGION!;

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: input.buffer,
      ContentType: input.mime,
      ACL: "public-read",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  // URL canónica del objeto en Spaces. Si en el futuro ponemos CDN delante
  // (Spaces lo ofrece), reemplazar por el dominio CDN.
  const publicUrl = `https://${bucket}.${region}.digitaloceanspaces.com/${key}`;

  return {
    key,
    url: publicUrl,
    publicUrl,
    size: input.buffer.length,
    mime: input.mime,
  };
}

function mimeToExt(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}
