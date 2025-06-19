import textToImage from './textToImage';
import mentionEveryone from './mentionEveryone';
import checkIfAdmin from './checkIfAdmin';
import { MessageMedia, Client, Message, GroupChat, ContactId } from 'whatsapp-web.js';
import * as utils from './utils';

var clc = require("cli-color");

async function groupHandeler(client: Client, message: Message, chat: GroupChat): Promise<void> {
  const mentions = await getMentionsArray(message);
  for (const mention of mentions) {
    if (mention === client.info.me._serialized) {

      const processedData = await getProcessedData(message)
      if (processedData) {
        const [replyData, options] = processedData;
        await message.reply(replyData, message.from, options)
      }
    }
  }
}

async function getMentionsArray(message: Message): Promise<string[]> {
  if (!message.mentionedIds) {
    return [];
  }
  return message.mentionedIds.map((id: any) => id._serialized || id);
}

async function getProcessedData(message: Message): Promise<[MessageMedia, object] | undefined> {
  const messageToProcess = message.hasQuotedMsg ? await message.getQuotedMessage() : message;
  return processMessage(messageToProcess)
}

async function processMessage(message: Message): Promise<[MessageMedia, object] | undefined> {
  const stickerOptions = {
    sendMediaAsSticker: true,
    stickerName: "Sticker Bot ^_^"
  };

  if (message.type === "image" || message.type == "video") {
    const media = await message.downloadMedia();
    return [media, stickerOptions]
  }
  if (message.type === "chat") {
    const text = message.body;
    if (text.length > utils.MAX_TEXT_LENGTH) {
      throw new utils.StringTooLongForSticker(text.length)
    }
    const stickerData = await textToImage(text);
    const media = new MessageMedia("image/png", stickerData, "sticker.png");
    return [media, stickerOptions]
  }
  if (message.type === "sticker") {
    const media = await message.downloadMedia();
    return [media, {}]
  }
}

export default groupHandeler;
