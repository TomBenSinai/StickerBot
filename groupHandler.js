const textToImage = require('./textToImage');
const { MessageMedia } = require('whatsapp-web.js');


async function groupHandeler(client, message, chat) {
  try{
  const mentions = await message.getMentions();
  for (let i = 0; i < mentions.length; i++) {
    if (mentions[i].number = "972557256950") {
      const quoted = await message.getQuotedMessage();
      if (message.type == "image" || message.type == "video") {
        console.log(message.type);
        const media = await message.downloadMedia();
        message.reply(media, undefined, {
          sendMediaAsSticker: true,
          stickerAuthor: "+972-557256950",
          stickerName: "Sticker Bot ^_^"
        });
      } else if (quoted.type == "image" || quoted.type == "video"){
        const media = await quoted.downloadMedia();
        quoted.reply(media, undefined, {
          sendMediaAsSticker: true,
          stickerAuthor: "+972-557256950",
          stickerName: "Sticker Bot ^_^"
        });
        break;
      } else {
        const text = quoted.body;
        const stickerData = await textToImage(text);
        const imageSticker = await new MessageMedia("image/png", stickerData);
        await chat.sendMessage(imageSticker, {
          sendMediaAsSticker: true,
          stickerAuthor: "+972-557256950",
          stickerName: "Sticker Bot ^_^"
        });
        break;
      }

      }

    }
  } catch (err) {
    console.log(err);
  }
  }



module.exports = groupHandeler;
