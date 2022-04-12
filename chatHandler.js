const textToImage = require('./textToImage');
const { MessageMedia } = require('whatsapp-web.js')



async function chatHandeler(client, message, chat) {
  try{

    //if a message is of type image/video - turn it into a sticker
    if (message.type == "image" || message.type == "video") {
      //download the media
      const media = await message.downloadMedia();
      //send it as a sticker
      chat.sendMessage(media, {
        sendMediaAsSticker: true,
        stickerAuthor: "+972-557256950",
        stickerName: "Sticker Bot ^_^"
      });
      //if a message is of type chat - make an image out of it then turn it into a sticker
    } else if (message.type == "chat"){
      const text = message.body;
      //turn text into an image
      const stickerData = await textToImage(text);
      //create new MessageMedia with the image
      const imageSticker = await new MessageMedia("image/png", stickerData);
      //send it as a sticker
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
