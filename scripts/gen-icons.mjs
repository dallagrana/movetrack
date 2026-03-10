/**
 * Generates PWA icons: public/icons/icon-192.png and public/icons/icon-512.png
 * Uses pure Node.js (no external dependencies). Generates a solid blue square PNG.
 * Run once: node scripts/gen-icons.mjs
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { deflateSync } from 'zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

function crc32(buf) {
  let c = 0xffffffff
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let v = i
    for (let j = 0; j < 8; j++) v = v & 1 ? 0xedb88320 ^ (v >>> 1) : v >>> 1
    table[i] = v
  }
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.concat([typeBytes, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcBuf))
  return Buffer.concat([len, typeBytes, data, crc])
}

function generatePNG(size) {
  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)   // width
  ihdr.writeUInt32BE(size, 4)   // height
  ihdr.writeUInt8(8, 8)         // bit depth
  ihdr.writeUInt8(2, 9)         // color type: RGB
  ihdr.writeUInt8(0, 10)        // compression
  ihdr.writeUInt8(0, 11)        // filter
  ihdr.writeUInt8(0, 12)        // interlace

  // Raw pixel data: blue (#2563EB) background with a white "M" truck area
  // R=37, G=99, B=235 for #2563EB
  const rawRows = []
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3)
    row[0] = 0 // filter type: None
    for (let x = 0; x < size; x++) {
      const off = 1 + x * 3
      // Rounded corner mask (simple corner check)
      const r = size * 0.2
      const cx = Math.abs(x - (x < size / 2 ? r : size - r))
      const cy = Math.abs(y - (y < size / 2 ? r : size - r))
      const inCorner = x < r && y < r || x > size - r && y < r ||
                       x < r && y > size - r || x > size - r && y > size - r
      const cornerDist = Math.sqrt(
        Math.pow(Math.min(x, size - 1 - x, r) - r, 2) +
        Math.pow(Math.min(y, size - 1 - y, r) - r, 2)
      )

      // Simple approach: solid blue square (maskable icon)
      row[off]     = 37   // R
      row[off + 1] = 99   // G
      row[off + 2] = 235  // B

      // Draw a white rectangle in the center (truck silhouette placeholder)
      const margin = size * 0.25
      if (x > margin && x < size - margin && y > margin && y < size - margin) {
        // White inner area
        const innerMargin = size * 0.32
        if (x > innerMargin && x < size - innerMargin &&
            y > innerMargin && y < size - innerMargin) {
          row[off]     = 255
          row[off + 1] = 255
          row[off + 2] = 255
        }
      }
    }
    rawRows.push(row)
  }

  const rawData = Buffer.concat(rawRows)
  const compressed = deflateSync(rawData)
  const idat = chunk('IDAT', compressed)

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk('IHDR', ihdr),
    idat,
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [192, 512]) {
  const buf = generatePNG(size)
  const outPath = join(outDir, `icon-${size}.png`)
  writeFileSync(outPath, buf)
  console.log(`Generated ${outPath} (${buf.length} bytes)`)
}
