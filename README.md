# StickerBot 🤖

A WhatsApp bot that turns your text and media into stickers instantly!

> [!WARNING]
> **Unofficial WhatsApp Bot - Use at Your Own Risk**
> 
> This is an unofficial WhatsApp bot that uses WhatsApp Web automation. Using this bot may violate WhatsApp's Terms of Service and could potentially result in your WhatsApp account being temporarily or permanently banned.
> 
> - This bot is **NOT** officially endorsed by WhatsApp
> - Use at your own risk
> - Consider using a secondary WhatsApp account for testing
> - We are not responsible for any account restrictions or bans
> 
> **By using this bot, you acknowledge and accept these risks.**

## What it does

- 📝 **Text to Stickers**: Send any text and get a custom sticker back
- 🖼️ **Media to Stickers**: Convert your images and videos into stickers
- 👥 **Works Everywhere**: Private chats and group chats
- 🎨 **Custom Fonts**: Beautiful text rendering with custom typography

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the bot**
   ```bash
   npm run dev
   ```

3. **Scan the QR code** with your phone's WhatsApp

4. **Start creating stickers!**
   - Send text → Get text sticker
   - Send image/video → Get media sticker
   - In groups: Mention the bot with your content

## Usage Examples

### Private Chat
- Send: `Hello World!` → Get a text sticker
- Send a photo → Get it as a sticker
- Send a video → Get it as a sticker

### Group Chat
- Send: `@StickerBot Hello everyone!` → Get a text sticker
- Reply to any message and mention the bot → Convert that message to sticker

## Commands

```bash
npm run dev      # Start in development mode
npm start        # Start in production mode
npm run build    # Build the project
```

## Requirements

- Node.js 16 or higher
- A phone with WhatsApp

## First Time Setup

1. Run the bot with `npm run dev`
2. A QR code will appear in your terminal
3. Open WhatsApp on your phone
4. Go to Settings → Linked Devices → Link a Device
5. Scan the QR code with your phone
6. The bot is now connected to your WhatsApp!

## Troubleshooting

**Bot won't start?**
- Make sure you have Node.js installed
- Try deleting the `.wwebjs_auth` folder and scanning the QR code again

**Stickers not working?**
- Check that your text isn't too long (keep it under 150 characters)
- Make sure the bot has permission to send messages

**Need to reconnect?**
- Delete the `.wwebjs_auth` folder
- Restart the bot and scan the QR code again

## Notes

- The bot remembers your login, so you only need to scan the QR code once
- Keep the terminal window open while using the bot
- The bot works with your existing WhatsApp account

---

Built with ❤️ using TypeScript and whatsapp-web.js
