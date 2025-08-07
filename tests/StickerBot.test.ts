import test from 'node:test';
import assert from 'node:assert';
import sharp from 'sharp';
import { StickerBot } from '../src/StickerBot';

// Utility to create a minimal WebP buffer
async function createWebPBase64(): Promise<string> {
  const pngBuffer = await sharp({
    create: { width: 1, height: 1, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  }).png().toBuffer();
  const webpBuffer = await sharp(pngBuffer).webp().toBuffer();
  return webpBuffer.toString('base64');
}

test('processStickerMessage converts WebP sticker to PNG image and disables sticker sending', async () => {
  const bot = new StickerBot();
  const base64WebP = await createWebPBase64();
  const message = {
    downloadMedia: async () => ({ data: base64WebP })
  } as any;

  const result = await (bot as any).processStickerMessage(message);

  assert.strictEqual(result.media.mimetype, 'image/png');
  const outputBuffer = Buffer.from(result.media.data, 'base64');
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert(outputBuffer.subarray(0, 8).equals(pngSignature));
  assert.deepStrictEqual(result.stickerOptions, { sendMediaAsSticker: false });
});
