import { existsSync, mkdirSync, chmodSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { platform, arch } from 'os';
import path from 'path';
import { findChromeExecutable } from '../utils';

export class SetupManager {
  private static binDir = path.join(process.cwd(), 'bin');
  private static assetsDir = path.join(process.cwd(), 'assets');

  static async setupAll(): Promise<void> {
    console.log('🚀 Setting up StickerBot dependencies...\n');
    
    // Create necessary directories
    this.createDirectories();
    
    // Setup ffmpeg
    await this.setupFFmpeg();
    
    // Setup Chrome (if needed)
    await this.setupChrome();
    
    // Verify setup
    this.verifySetup();
    
    console.log('✅ Setup completed successfully!\n');
  }

  private static createDirectories(): void {
    console.log('📁 Creating directories...');
    
    if (!existsSync(this.binDir)) {
      mkdirSync(this.binDir, { recursive: true });
      console.log('  ✅ Created bin/ directory');
    }
    
    if (!existsSync(this.assetsDir)) {
      mkdirSync(this.assetsDir, { recursive: true });
      console.log('  ✅ Created assets/ directory');
    }
  }

  static async setupFFmpeg(): Promise<void> {
    console.log('\n🎬 Setting up FFmpeg...');
    
    // Check if ffmpeg is already available globally
    try {
      execSync('ffmpeg -version', { stdio: 'pipe' });
      console.log('  ✅ FFmpeg already installed globally');
      return;
    } catch {
      console.log('  📥 FFmpeg not found globally, downloading static binary...');
    }

    const ffmpegPath = path.join(this.binDir, 'ffmpeg');
    if (existsSync(ffmpegPath)) {
      console.log('  ✅ FFmpeg binary already exists locally');
      return;
    }

    try {
      const currentPlatform = platform();
      const currentArch = arch();
      
      if (currentPlatform === 'linux' && currentArch === 'x64') {
        await this.downloadLinuxFFmpeg();
      } else if (currentPlatform === 'win32') {
        await this.downloadWindowsFFmpeg();
      } else if (currentPlatform === 'darwin') {
        await this.downloadMacOSFFmpeg();
      } else {
        throw new Error(`Unsupported platform: ${currentPlatform}-${currentArch}`);
      }
      
      console.log('  ✅ FFmpeg installed successfully');
    } catch (error) {
      console.error('  ❌ Failed to install FFmpeg:', error);
      console.log('  💡 Please install FFmpeg manually:');
      console.log('     Ubuntu/Debian: sudo apt install ffmpeg');
      console.log('     macOS: brew install ffmpeg');
      console.log('     Windows: Download from https://ffmpeg.org/download.html');
    }
  }

  private static async downloadLinuxFFmpeg(): Promise<void> {
    const commands = [
      'cd bin',
      'wget -q https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz',
      'tar -xf ffmpeg-release-amd64-static.tar.xz --strip-components=1',
      'rm ffmpeg-release-amd64-static.tar.xz',
      'chmod +x ffmpeg ffprobe'
    ];
    
    for (const cmd of commands) {
      execSync(cmd, { stdio: 'pipe' });
    }
  }

  private static async downloadWindowsFFmpeg(): Promise<void> {
    console.log('  💡 For Windows, please download FFmpeg from:');
    console.log('     https://www.gyan.dev/ffmpeg/builds/');
    console.log('     Extract and add to PATH or place in bin/ directory');
  }

  private static async downloadMacOSFFmpeg(): Promise<void> {
    try {
      execSync('brew install ffmpeg', { stdio: 'pipe' });
    } catch {
      console.log('  💡 For macOS, please install Homebrew and run:');
      console.log('     brew install ffmpeg');
    }
  }

  static async setupChrome(): Promise<void> {
    console.log('\n🌐 Setting up Chrome...');
    
    const chromePath = findChromeExecutable();
    if (chromePath) {
      console.log(`  ✅ Chrome found at: ${chromePath}`);
      return;
    }

    console.log('  📥 Chrome not found, providing installation instructions...');
    
    const currentPlatform = platform();
    
    if (currentPlatform === 'linux') {
      console.log('  💡 To install Chrome on Linux:');
      console.log('     wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -');
      console.log('     echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list');
      console.log('     sudo apt update && sudo apt install google-chrome-stable');
    } else if (currentPlatform === 'win32') {
      console.log('  💡 To install Chrome on Windows:');
      console.log('     Download from: https://www.google.com/chrome/');
    } else if (currentPlatform === 'darwin') {
      console.log('  💡 To install Chrome on macOS:');
      console.log('     Download from: https://www.google.com/chrome/');
      console.log('     Or use Homebrew: brew install --cask google-chrome');
    }
  }

  static verifySetup(): void {
    console.log('\n🔍 Verifying setup...');
    
    // Check ffmpeg
    const ffmpegGlobal = this.checkCommand('ffmpeg');
    const ffmpegLocal = existsSync(path.join(this.binDir, 'ffmpeg'));
    
    if (ffmpegGlobal || ffmpegLocal) {
      console.log('  ✅ FFmpeg is available');
    } else {
      console.log('  ❌ FFmpeg is not available');
    }
    
    // Check Chrome
    const chromePath = findChromeExecutable();
    if (chromePath) {
      console.log('  ✅ Chrome is available');
    } else {
      console.log('  ❌ Chrome is not available (will use Chromium)');
    }
    
    // Check Node.js version
    const nodeVersion = process.version;
    console.log(`  ✅ Node.js version: ${nodeVersion}`);
  }

  private static checkCommand(command: string): boolean {
    try {
      execSync(`${command} -version`, { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  static createInstallScript(): void {
    console.log('\n📝 Creating installation scripts...');
    
    // Create install script for Linux/macOS
    const installScript = `#!/bin/bash
set -e

echo "🚀 Installing StickerBot dependencies..."

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install ffmpeg
echo "🎬 Installing FFmpeg..."
if command -v ffmpeg &> /dev/null; then
    echo "  ✅ FFmpeg already installed"
else
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt update && sudo apt install -y ffmpeg
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install ffmpeg
    else
        echo "  ❌ Please install FFmpeg manually"
    fi
fi

# Install Chrome
echo "🌐 Installing Chrome..."
if command -v google-chrome &> /dev/null; then
    echo "  ✅ Chrome already installed"
else
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
        echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
        sudo apt update && sudo apt install -y google-chrome-stable
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install --cask google-chrome
    else
        echo "  ❌ Please install Chrome manually"
    fi
fi

echo "✅ Installation completed!"
`;

    writeFileSync('install.sh', installScript);
    chmodSync('install.sh', '755');
    console.log('  ✅ Created install.sh');

    // Create install script for Windows
    const installBat = `@echo off
echo 🚀 Installing StickerBot dependencies...

echo 📦 Installing Node.js dependencies...
npm install

echo 🎬 Please install FFmpeg manually:
echo   Download from: https://www.gyan.dev/ffmpeg/builds/
echo   Extract and add to PATH

echo 🌐 Please install Chrome manually:
echo   Download from: https://www.google.com/chrome/

echo ✅ Installation completed!
pause
`;

    writeFileSync('install.bat', installBat);
    console.log('  ✅ Created install.bat');
  }
}

// CLI usage
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'all':
      SetupManager.setupAll();
      break;
    case 'ffmpeg':
      SetupManager.setupFFmpeg();
      break;
    case 'chrome':
      SetupManager.setupChrome();
      break;
    case 'verify':
      SetupManager.verifySetup();
      break;
    case 'scripts':
      SetupManager.createInstallScript();
      break;
    default:
      console.log('Usage: npm run setup [all|ffmpeg|chrome|verify|scripts]');
  }
} 
