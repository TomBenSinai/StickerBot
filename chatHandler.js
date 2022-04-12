const textToImage = require('./textToImage');
const { MessageMedia } = require('whatsapp-web.js')


async function chatHandeler(client, message, chat) {
  try{
    if (message.type == "image" || message.type == "video") {
      const media = await message.downloadMedia();
      chat.sendMessage(media, {
        sendMediaAsSticker: true,
        stickerAuthor: "+972-557256950",
        stickerName: "Sticker Bot ^_^"
      });
    } else {
      const text = message.body;
      const stickerData = await textToImage(text);
      const imageSticker = await new MessageMedia("image/png", stickerData);
      await chat.sendMessage(imageSticker, {
        sendMediaAsSticker: true,
        stickerAuthor: "+972-557256950",
        stickerName: "Sticker Bot ^_^"
      });
    }
  } catch (err) {
    console.log(err);
  }
  }



module.exports = chatHandeler;
