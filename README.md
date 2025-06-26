# StickerBot 🤖

A WhatsApp bot that turns your text and media into stickers instantly!

> [!WARNING]
> **Unofficial WhatsApp Bot - Use at Your Own Risk**
> 
> This is an unofficial WhatsApp bot that uses WhatsApp Web automation. Using this bot may violate WhatsApp's Terms of Service and could potentially result in your WhatsApp account being temporarily or permanently banned.
> Consider using a secondary WhatsApp account for testing
>
> **By using this bot, you acknowledge and accept these risks.** We are not responsible for any account restrictions or bans

## Supported features

- Text to Stickers
- Media to Stickers
- Groups and private chats

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

1. **Start the bot**
   ```bash
   npm run dev
   ```

1. **Scan the QR code** with your phone's WhatsApp
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices → Link a Device

1. **Start creating stickers!**
   - Send text → Get text sticker
   - Send image/video → Get media sticker
   - In groups: Mention the bot with your content

## Requirements

- Node.js 18 or higher
- A phone with WhatsApp

## Usage Examples

### Private Chat
- Send: `Hello World!` → Get a text sticker
- Send a photo → Get it as a sticker
- Send a video → Get it as a sticker

### Group Chat
- Send: `@StickerBot Hello everyone!` → Get a text sticker
- Reply to any message and mention the bot → Convert that message to sticker

## Troubleshooting

**Bot won't start?**
- Try deleting the `.wwebjs_auth` folder and scanning the QR code again

**Need to reconnect?**
- Delete the `.wwebjs_auth` folder
- Restart the bot and scan the QR code again

## Notes

- The bot remembers your login, so you only need to scan the QR code once
- Keep the terminal window open while using the bot
- The bot works with your existing WhatsApp account

---

Built with ❤️ using TypeScript and whatsapp-web.js
