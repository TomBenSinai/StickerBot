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
