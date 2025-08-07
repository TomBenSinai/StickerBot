import test from 'node:test';
import assert from 'node:assert';
import { createCanvas } from 'canvas';
import { TextToImageService } from '../src/services/TextToImage/TextToImageService';

// Helper to create a canvas context with a preset font
function createContext() {
  const canvas = createCanvas(1000, 1000);
  const ctx = canvas.getContext('2d');
  ctx.font = '20px "Open Sans"';
  return ctx;
}

test('wrapText splits long strings within maxWidth', () => {
  const service = new TextToImageService();
  const ctx = createContext();
  const text = 'This is a very long string that should wrap into multiple lines when given a small width.';
  const maxWidth = 200;
  const lines: string[] = (service as any).wrapText(ctx, text, maxWidth);
  assert(lines.length > 1, 'Expected the text to wrap into multiple lines');
  for (const line of lines) {
    assert(ctx.measureText(line).width <= maxWidth, 'Line exceeds maxWidth');
  }
});

test('wrapText handles single extremely long words', () => {
  const service = new TextToImageService();
  const ctx = createContext();
  const longWord = 'supercalifragilisticexpialidocioussupercalifragilisticexpialidocious';
  const maxWidth = 50;
  const lines: string[] = (service as any).wrapText(ctx, longWord, maxWidth);
  assert.deepStrictEqual(lines, [longWord]);
});

test('wrapText handles text containing newline characters', () => {
  const service = new TextToImageService();
  const ctx = createContext();
  const multiLine = 'First line\nSecond line with more words';
  const maxWidth = 150; // Force wrapping
  const lines: string[] = (service as any).wrapText(ctx, multiLine, maxWidth);
  assert(lines.length > 1, 'Expected text to wrap into multiple lines');
  for (const line of lines) {
    assert(!line.includes('\n'), 'Newline should not appear in output lines');
    assert(ctx.measureText(line).width <= maxWidth, 'Line exceeds maxWidth');
  }
});

test('getFontFamily includes emoji fallbacks when custom fonts are registered', () => {
  const service = new TextToImageService();
  const ltrFamily = (service as any).getFontFamily('ltr');
  assert.ok(ltrFamily.startsWith('"Open Sans"'), 'LTR font should start with custom font');
  assert.ok(ltrFamily.includes('"Apple Color Emoji"'), 'Emoji fallback missing');
  assert.ok(ltrFamily.includes('"Segoe UI Emoji"'), 'Emoji fallback missing');
  assert.ok(ltrFamily.includes('"Noto Color Emoji"'), 'Emoji fallback missing');

  const rtlFamily = (service as any).getFontFamily('rtl');
  assert.ok(rtlFamily.startsWith('"CustomFont"'), 'RTL font should start with custom font');
  assert.ok(rtlFamily.includes('"Apple Color Emoji"'), 'Emoji fallback missing');
});

test('getFontFamily falls back to emoji fonts when custom fonts are unavailable', () => {
  const service = new TextToImageService();
  (service as any).fontRegistered = false;
  const family = (service as any).getFontFamily('ltr');
  assert.ok(family.startsWith('"Apple Color Emoji"'), 'Fallback should start with emoji fonts');
  assert.ok(!family.includes('"Open Sans"'), 'Should not include custom font when fonts are unregistered');
});
