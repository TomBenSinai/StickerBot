@echo off
echo Installing StickerBot dependencies...

echo Installing Node.js dependencies...
npm install

echo Downloading Noto Color Emoji font...
if not exist assets\fonts mkdir assets\fonts
if not exist assets\fonts\NotoColorEmoji.ttf (
  powershell -Command "(New-Object System.Net.WebClient).DownloadFile('https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoColorEmoji.ttf', 'assets/fonts/NotoColorEmoji.ttf')"
) else (
  echo Noto Color Emoji font already exists
)

echo Please install FFmpeg manually:
echo   Download from: https://www.gyan.dev/ffmpeg/builds/
echo   Extract and add to PATH

echo Please install Chrome manually:
echo   Download from: https://www.google.com/chrome/

echo Installation completed!
pause
