import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const publicDir = resolve(root, 'public')

const srcSvg = resolve(publicDir, 'logo.svg')
const icons = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
]

const splash = [
  { file: 'splash-640x1136.png', w: 640, h: 1136 },
  { file: 'splash-750x1334.png', w: 750, h: 1334 },
  { file: 'splash-828x1792.png', w: 828, h: 1792 },
  { file: 'splash-1125x2436.png', w: 1125, h: 2436 },
  { file: 'splash-1170x2532.png', w: 1170, h: 2532 },
  { file: 'splash-1242x2688.png', w: 1242, h: 2688 },
  { file: 'splash-1284x2778.png', w: 1284, h: 2778 },
  { file: 'splash-1536x2048.png', w: 1536, h: 2048 },
  { file: 'splash-1668x2224.png', w: 1668, h: 2224 },
  { file: 'splash-1668x2388.png', w: 1668, h: 2388 },
  { file: 'splash-2048x2732.png', w: 2048, h: 2732 },
]

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true })
}

async function run() {
  const svg = await readFile(srcSvg)
  await ensureDir(publicDir)

  // Icons
  for (const { file, size } of icons) {
    const out = resolve(publicDir, file)
    const png = await sharp(svg).resize(size, size, { fit: 'cover' }).png().toBuffer()
    await writeFile(out, png)
  }

  // Splash screens (center the square logo on background)
  for (const { file, w, h } of splash) {
    const out = resolve(publicDir, file)
    const background = { r: 14, g: 165, b: 233, alpha: 1 }
    const bg = sharp({ create: { width: w, height: h, channels: 4, background } })
    const logoSize = Math.floor(Math.min(w, h) * 0.3)
    const logoPng = await sharp(svg).resize(logoSize, logoSize).png().toBuffer()
    const composite = await bg.composite([{ input: logoPng, gravity: 'center' }]).png().toBuffer()
    await writeFile(out, composite)
  }

  console.log('Generated icons and splash screens in public/.')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})

