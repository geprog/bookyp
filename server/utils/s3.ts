import type { Buffer } from 'node:buffer';
import type { Readable } from 'node:stream';
import { Client } from 'minio';

let client: Client | undefined;
let bucketReady: Promise<void> | undefined;

function getConfig() {
  const { s3 } = useRuntimeConfig();
  if (!s3.endpoint || !s3.accessKey || !s3.secretKey || !s3.bucket) {
    throw createError({ statusCode: 500, statusMessage: 'S3 storage is not configured' });
  }
  return s3;
}

function getClient(): Client {
  if (!client) {
    const s3 = getConfig();
    client = new Client({
      endPoint: s3.endpoint,
      port: Number(s3.port),
      useSSL: Boolean(s3.useSsl),
      accessKey: s3.accessKey,
      secretKey: s3.secretKey,
    });
  }
  return client;
}

async function useBucket(): Promise<{ client: Client; bucket: string }> {
  const { bucket } = getConfig();
  const minio = getClient();
  if (!bucketReady) {
    bucketReady = (async () => {
      if (!(await minio.bucketExists(bucket))) {
        await minio.makeBucket(bucket);
      }
    })();
  }
  await bucketReady;
  return { client: minio, bucket };
}

export async function putFile(key: string, data: Buffer, contentType: string): Promise<void> {
  const { client: minio, bucket } = await useBucket();
  await minio.putObject(bucket, key, data, data.length, { 'Content-Type': contentType });
}

export async function getFile(key: string): Promise<{ stream: Readable; contentType: string; size: number }> {
  const { client: minio, bucket } = await useBucket();
  const stat = await minio.statObject(bucket, key);
  const stream = await minio.getObject(bucket, key);
  return { stream, contentType: String(stat.metaData?.['content-type'] ?? 'application/octet-stream'), size: stat.size };
}

/** Removes all files below the given prefix except the one to keep. */
export async function removeFiles(prefix: string, keep?: string): Promise<void> {
  const { client: minio, bucket } = await useBucket();
  const toRemove: string[] = [];
  await new Promise<void>((resolve, reject) => {
    const stream = minio.listObjectsV2(bucket, prefix, true);
    stream.on('data', (obj) => {
      if (obj.name && obj.name !== keep) {
        toRemove.push(obj.name);
      }
    });
    stream.on('end', () => resolve());
    stream.on('error', reject);
  });
  if (toRemove.length > 0) {
    await minio.removeObjects(bucket, toRemove);
  }
}
