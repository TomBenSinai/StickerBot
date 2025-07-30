import { existsSync } from 'fs';
import { platform } from 'os';
import { execSync } from 'child_process';
import path from 'path';

export class NonStickerableItemError extends Error {
  constructor(message = "This item is not stickerable") {
    super(message);
    this.name = "NonStickerableItemError";
  }
}

export class StringTooLongForSticker extends NonStickerableItemError {
  length: number;
  cause: string;

  constructor(length: number, message = `*Text is too long ^_^. Please use shorter text for stickers.*`) {
    super(message);
    this.length = length;
    this.name = "StringTooLongForSticker";
    this.cause = `Text is too long to be a sticker`;
  }
}

export function findChromeExecutable(): string | null {
  const possiblePaths: string[] = [];
  
  const currentPlatform = platform();
  
  if (currentPlatform === 'win32') {
    possiblePaths.push(
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
    );
  } else if (currentPlatform === 'darwin') {
    possiblePaths.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    );
  } else {
    // Linux and other Unix-like systems
    possiblePaths.push(
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium'
    );
  }

  for (const path of possiblePaths) {
    if (path && existsSync(path)) {
      return path;
    }
  }

  return null;
}

export function findFFmpegExecutable(): string | null {
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    return 'ffmpeg';
  } catch {
    const localFFmpeg = path.join(process.cwd(), 'bin', 'ffmpeg');
    if (existsSync(localFFmpeg)) {
      return localFFmpeg;
    }
  }
  
  return null;
}
