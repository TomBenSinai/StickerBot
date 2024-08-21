const textToImage = require('./textToImage.js');
const mentionEveryone = require('./mentionEveryone.js');
const checkIfAdmin = require('./checkIfAdmin.js');
const { MessageMedia } = require('whatsapp-web.js');
const utils = require('./utils.js');

var clc = require("cli-color");

async function groupHandeler(client, message, chat) {
  const mentions = await getMentionsArray(message);
  for (const mention of mentions) {
    if (mention === client.info.me._serialized) {

      const [replyData, options] = await getProcessedData(message)
      await message.reply(replyData, message.from, options)
    }
  }



  }

async function getMentionsArray(message) {
  if (typeof(message.mentionedIds[0]) === "object") {
    return await message.mentionedIds.map(mantion => mantion._serialized)
  }
  return await message.mentionedIds
}

async function getProcessedData(message) {
  const messageToProcess =  message.hasQuotedMsg ? await message.getQuotedMessage() : message;
  return await processMessage(messageToProcess)
}

async function processMessage(message) {
  stickerOptions = options = {
    sendMediaAsSticker: true,
    stickerName: "Sticker Bot ^_^"
  }

  if (message.type === "image" || message.type == "video") {
    return [await message.downloadMedia(), stickerOptions]
  }
  if (message.type === "chat") {
      const text = message.body;
        if (text.length > utils.MAX_TEXT_LENGTH) {
          throw new utils.StringTooLongForSticker(text.length)
        }
      const stickerData = await textToImage(text);
      return [await new MessageMedia("image/png", stickerData), stickerOptions]
    }
    if (message.type === "sticker") {
      return [await message.downloadMedia(), {}]

    }
}


module.exports = groupHandeler;
