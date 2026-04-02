import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "../../config/env.js";
import type { UploadImageInput } from "./image.schema.js";

export class ImageError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 500,
  ) {
    super(message);
  }
}

const getRequiredConfig = () => {
  if (!env.R2_BUCKET_NAME) {
    throw new ImageError("R2_BUCKET_NAME is not configured", 500);
  }
  if (!env.R2_ACCESS_KEY) {
    throw new ImageError("R2_ACCESS_KEY is not configured", 500);
  }
  if (!env.R2_SECRET_KEY) {
    throw new ImageError("R2_SECRET_KEY is not configured", 500);
  }
  if (!env.CLOUDFLARE_ACCOUNT_ID) {
    throw new ImageError("CLOUDFLARE_ACCOUNT_ID is not configured", 500);
  }

  return {
    bucket: env.R2_BUCKET_NAME,
    accessKeyId: env.R2_ACCESS_KEY,
    secretAccessKey: env.R2_SECRET_KEY,
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
  };
};

export class ImageService {
  async uploadImage(input: UploadImageInput) {
    const config = getRequiredConfig();
    const key = `uploads/${Math.floor(Date.now() / 1000)}_${input.filename}`;

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });

    const imageUrl = await getSignedUrl(client, command, {
      expiresIn: 60 * 15,
    });

    return {
      imageUrl,
    };
  }
}
