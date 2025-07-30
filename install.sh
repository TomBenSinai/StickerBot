#!/bin/bash
set -e

echo "Installing StickerBot dependencies..."

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Install ffmpeg
echo "Installing FFmpeg..."
if command -v ffmpeg &> /dev/null; then
    echo "FFmpeg already installed"
else
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt update && sudo apt install -y ffmpeg
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install ffmpeg
    else
        echo "Please install FFmpeg manually"
    fi
fi

# Install Chrome
echo "Installing Chrome..."
if command -v google-chrome &> /dev/null; then
    echo "Chrome already installed"
else
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
        echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
        sudo apt update && sudo apt install -y google-chrome-stable
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install --cask google-chrome
    else
        echo "Please install Chrome manually"
    fi
fi

echo "Installation completed!"
