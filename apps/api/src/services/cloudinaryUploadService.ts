/**
 * Upload files to Cloudinary (no local storage). HSLL Enterprise.
 */
import { config } from '../config/env.js';

export interface UploadResult {
  url: string;
  publicId: string;
  secureUrl?: string;
}

export function isCloudinaryConfigured(): boolean {
  const c = config.cloudinary;
  return !!(c?.cloudName && c?.apiKey && c?.apiSecret);
}

function getCloudinary(): ReturnType<typeof require> | null {
  if (!isCloudinaryConfigured()) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('../cloudinary.js').default;
}

export async function uploadBuffer(
  fileBuffer: Buffer,
  options: { folder?: string; resourceType?: 'image' | 'raw' | 'auto'; publicId?: string; mimeType?: string } = {}
): Promise<UploadResult> {
  const cloudinary = getCloudinary();
  if (!cloudinary) throw new Error('Cloudinary not configured');

  const { folder = 'hsll', resourceType = 'auto', publicId, mimeType = 'application/octet-stream' } = options;
  const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      dataUri,
      { folder, resource_type: resourceType, public_id: publicId },
      (err: Error | null, result: { secure_url?: string; url?: string; public_id?: string }) => {
        if (err) return reject(err);
        if (!result?.secure_url && !result?.url) return reject(new Error('No URL returned'));
        resolve({
          url: result.secure_url ?? result.url ?? '',
          secureUrl: result.secure_url,
          publicId: result.public_id ?? '',
        });
      }
    );
  });
}
