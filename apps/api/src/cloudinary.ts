/**
 * Cloudinary v2 config – loaded lazily by cloudinaryUploadService only when
 * CLOUDINARY_* env vars are configured. Do not import this file directly.
 *
 * The `require()` here is intentional: cloudinary ships CJS-only and is an
 * optional runtime dep (not listed in package.json; only needed when configured).
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const cloudinaryPkg = require('cloudinary') as { v2: any };
const cloudinary = cloudinaryPkg.v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default cloudinary as any;
