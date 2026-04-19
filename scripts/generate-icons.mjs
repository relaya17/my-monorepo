/**
 * generate-icons.mjs
 * Creates placeholder PNG icons for PWA + iOS in brand color (#e8356d).
 * Run with: node scripts/generate-icons.mjs
 * Replace the output files with your final designed icons before App Store submission.
 */

import zlib from "zlib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── CRC32 ──────────────────────────────────────────────────────────────────
const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  CRC_TABLE[n] = c;
}
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++)
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ -1) >>> 0;
}

// ── PNG chunk builder ──────────────────────────────────────────────────────
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, c]);
}

// ── Solid-color PNG with a white sparkle "✦" drawn in the centre ───────────
function createPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  // Build raw scanlines (filter byte 0 + 3 bytes per pixel)
  const rowLen = 1 + size * 3;
  const raw = Buffer.alloc(size * rowLen);

  // Background fill
  for (let y = 0; y < size; y++) {
    raw[y * rowLen] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const off = y * rowLen + 1 + x * 3;
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b;
    }
  }

  // Draw a simple white cross / plus in the centre (40% of size)
  const cx = Math.floor(size / 2);
  const cy = Math.floor(size / 2);
  const armLen = Math.floor(size * 0.2);
  const thick = Math.max(2, Math.floor(size * 0.06));

  const setWhite = (px, py) => {
    if (px < 0 || py < 0 || px >= size || py >= size) return;
    const off = py * rowLen + 1 + px * 3;
    raw[off] = 255; raw[off + 1] = 255; raw[off + 2] = 255;
  };

  for (let i = -armLen; i <= armLen; i++) {
    for (let t = -thick; t <= thick; t++) {
      setWhite(cx + i, cy + t); // horizontal
      setWhite(cx + t, cy + i); // vertical
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdrData),
    chunk("IDAT", compressed),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ── Brand colour #e8356d = rgb(232, 53, 109) ───────────────────────────────
const [R, G, B] = [232, 53, 109];

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

const icons = [
  { file: "icon-192x192.png",    size: 192 },
  { file: "icon-512x512.png",    size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
];

for (const { file, size } of icons) {
  const png = createPNG(size, R, G, B);
  const dest = path.join(outDir, file);
  fs.writeFileSync(dest, png);
  console.log(`✓ ${file}  (${size}×${size}px, ${png.length} bytes)`);
}

console.log("\nDone! Replace files in public/icons/ with your final designed icons before App Store submission.");
