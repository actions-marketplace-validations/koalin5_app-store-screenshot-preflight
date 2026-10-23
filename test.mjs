import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkPaths, inspectBytes, report, sizeClass } from './cli.mjs'

function chunk(type, data = Buffer.alloc(0)) {
  const result = Buffer.alloc(12 + data.length)
  result.writeUInt32BE(data.length, 0)
  result.write(type, 4, 'ascii')
  data.copy(result, 8)
  return result
}

function png(width, height, colorType = 2, transparent = false) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = colorType
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    ...(transparent ? [chunk('tRNS', Buffer.from([0]))] : []),
    chunk('IDAT', Buffer.from([0])),
    chunk('IEND'),
  ])
}

function jpeg(width, height) {
  const frame = Buffer.from([0xff, 0xc0, 0, 11, 8, height >> 8, height & 255, width >> 8, width & 255, 1, 1, 0x11, 0])
  return Buffer.concat([Buffer.from([0xff, 0xd8]), frame, Buffer.from([0xff, 0xd9])])
}

test('recognizes accepted portrait and landscape sizes and rejects an unlisted size', () => {
  assert.equal(sizeClass(1206, 2622), 'iPhone Dynamic Island, medium')
  assert.equal(sizeClass(2622, 1206), 'iPhone Dynamic Island, medium')
  assert.equal(sizeClass(1000, 1000), null)
})

test('flags both alpha channel and palette transparency, with no false pass for invalid files', () => {
  assert.equal(inspectBytes(png(1206, 2622, 6)).alpha, true)
  assert.equal(inspectBytes(png(1206, 2622, 3, true)).alpha, true)
  assert.equal(inspectBytes(png(1206, 2622)).alpha, false)
  assert.deepEqual(inspectBytes(jpeg(1206, 2622)), { width: 1206, height: 2622, format: 'JPEG', alpha: false })
  assert.throws(() => inspectBytes(Buffer.from('not an image')), /not PNG or JPEG/)
})

test('groups counts by folder and device class, then fails an oversized set', async () => {
  const root = await mkdtemp(join(tmpdir(), 'storestudio-preflight-'))
  try {
    const english = join(root, 'en-US')
    const french = join(root, 'fr-FR')
    await mkdir(english)
    await mkdir(french)
    for (let index = 0; index < 11; index++) await writeFile(join(english, `${index}.png`), png(1206, 2622))
    await writeFile(join(french, 'one.png'), png(1206, 2622))
    const result = report(await checkPaths([english, french]))
    assert.equal(result.failures, 11)
    assert.match(result.lines.join('\n'), /maximum 10 per device size and localization/)
    assert.match(result.lines.join('\n'), /PASS one.png/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
