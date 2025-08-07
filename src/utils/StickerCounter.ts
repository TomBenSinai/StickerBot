import fs from 'fs/promises';
import path from 'path';

const COUNT_FILE = path.join(process.cwd(), '.sticker-count');

export async function loadStickerCount(): Promise<number> {
  try {
    const data = await fs.readFile(COUNT_FILE, 'utf-8');
    const parsed = parseInt(data, 10);
    return isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
}

export async function saveStickerCount(count: number): Promise<void> {
  await fs.writeFile(COUNT_FILE, String(count), 'utf-8');
}
