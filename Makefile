.PHONY: help install setup build dev start clean test lint format deps chrome ffmpeg verify docker

install: deps setup
	@echo "Installation completed!"

setup: build
	@npm run setup:all

setup-chrome: build
	@npm run setup:chrome

setup-ffmpeg: build
	@npm run setup:ffmpeg

deps:
	@npm install

verify: build
	@npm run setup:verify

build:
	@npm run build

dev: build
	@npm run dev

start: build
	@npm run start

watch:
	@npm run watch

clean:
	@npm run clean

rebuild:
	@npm run rebuild

lint:
	@npx tsc --noEmit

format:
	@npx prettier --write "src/**/*.ts" "*.ts" "*.js" "*.json" || echo "⚠️  Prettier not configured"

test: 
	@npm test

docker-build:   
	@docker build -t stickerbot .

docker-run: docker-build
	@docker run -it --rm stickerbot

docker-dev: docker-build
	@docker run -it --rm -e NODE_ENV=development stickerbot

clean-all: clean
	@rm -rf node_modules
	@rm -rf bin
	@rm -rf .wwebjs_auth
	@rm -f install.sh install.bat

update:
	@npm update

install-linux: deps
	@sudo apt update
	@sudo apt install -y ffmpeg wget curl
	@wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
	@echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
	@sudo apt update && sudo apt install -y google-chrome-stable

install-macos: deps
	@brew install ffmpeg
	@brew install --cask google-chrome

install-windows: deps
	@echo "Windows setup instructions:"
	@echo "  1. Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/"
	@echo "  2. Extract and add to PATH"
	@echo "  3. Download Chrome from: https://www.google.com/chrome/"
	@echo "  4. Run: make verify"

quick-start-linux: install-linux build verify dev

quick-start-macos: install-macos build verify dev

quick-start-windows: install-windows build verify
	@echo "Please install FFmpeg and Chrome manually, then run: make dev"

logs:
	@tail -f logs/*.log 2>/dev/null || echo "No log files found"

create-scripts: build
	@npm run setup:scripts

env-check:
	@echo "Checking environment..."
	@node --version
	@npm --version
	@git --version
	@docker --version
	@echo "Environment check completed" 
