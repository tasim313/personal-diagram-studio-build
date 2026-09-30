import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const svgPath = path.resolve('public/icon.svg')
const svgBuffer = fs.readFileSync(svgPath)

function createIcoFromPng(pngBuffer, width, height) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // Reserved
  header.writeUInt16LE(1, 2) // Type 1 = ICO
  header.writeUInt16LE(1, 4) // Number of images

  const entry = Buffer.alloc(16)
  entry.writeUInt8(width >= 256 ? 0 : width, 0)
  entry.writeUInt8(height >= 256 ? 0 : height, 1)
  entry.writeUInt8(0, 2) // Color palette
  entry.writeUInt8(0, 3) // Reserved
  entry.writeUInt16LE(1, 4) // Color planes
  entry.writeUInt16LE(32, 6) // Bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8) // Image data size
  entry.writeUInt32LE(22, 12) // Offset (6 + 16 = 22)

  return Buffer.concat([header, entry, pngBuffer])
}

async function run() {
  console.log('Generating crisp branding icons from Studio SVG...')

  // 1. 32x32 PNG for favicon
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer()
  const ico32 = createIcoFromPng(png32, 32, 32)
  fs.writeFileSync('public/favicon.ico', ico32)
  fs.writeFileSync('app/favicon.ico', ico32)
  console.log('Created public/favicon.ico & app/favicon.ico')

  // 2. 180x180 Apple Touch Icon
  const apple180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer()
  fs.writeFileSync('public/apple-icon.png', apple180)
  fs.writeFileSync('app/apple-icon.png', apple180)
  console.log('Created public/apple-icon.png & app/apple-icon.png')

  // 3. 32x32, 48x48, 192x192 icons
  fs.writeFileSync('public/icon-32x32.png', png32)
  const png192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer()
  fs.writeFileSync('public/icon-192x192.png', png192)

  console.log('All icons generated successfully!')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
