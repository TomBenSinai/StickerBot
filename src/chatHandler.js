const textToImage = require('./textToImage.js');
const { MessageMedia } = require('whatsapp-web.js')
var clc = require("cli-color");



async function chatHandeler(client, message, chat) {
  try{

    //if a message is of type image/video - turn it into a sticker
    if (message.type == "image" || message.type == "video") {
      const media = await message.downloadMedia();
      chat.sendMessage(media, {
        sendMediaAsSticker: true,
        stickerAuthor: "",
        stickerName: "Sticker Bot ^_^"
      });
      //if a message is of type chat - make an image out of it then turn it into a sticker
    } else if (message.type === "chat"){
      const text = message.body;
      const stickerData = await textToImage(text);
      if (stickerData == "TextTooLong") {
        chat.sendMessage("*Text is too long. The maximum length supported is 170 characters.*")
      } else {
        const imageSticker = await new MessageMedia("image/png", stickerData);
        await chat.sendMessage(imageSticker, {
          sendMediaAsSticker: true,
          stickerAuthor: "",
          stickerName: "Sticker Bot ^_^"
        });
      }
    } else if (message.type === "sticker") {
      let media = await message.downloadMedia();
        message.reply(media);
    }
  } catch (err) {
    console.log(clc.red(err));
  }
  }



module.exports = chatHandeler;
