import textToImage from './textToImage';
import { MessageMedia, Client, Message, Chat } from 'whatsapp-web.js';
import clc from "cli-color";

async function chatHandler(client: Client, message: Message, chat: Chat): Promise<void> {
  try {

    if (message.type == "image" || message.type == "video") {
      const media = await message.downloadMedia();
      chat.sendMessage(media, {
        sendMediaAsSticker: true,
        stickerAuthor: "",
        stickerName: "Sticker Bot ^_^"
      });
    } else if (message.type === "chat") {
      const text = message.body;
      const stickerData = await textToImage(text);
      const imageSticker = new MessageMedia("image/png", stickerData, "sticker.png");
      await chat.sendMessage(imageSticker, {
        sendMediaAsSticker: true,
        stickerAuthor: "",
        stickerName: "Sticker Bot ^_^"
      });
    } else if (message.type === "sticker") {
      let media = await message.downloadMedia();
      message.reply(media);
    }
  } catch (err) {
    console.log(clc.red(String(err)));
  }
}

export default chatHandler;
