const textToImage = require('./textToImage');
const mentionEveryone = require('./mentionEveryone.js');
const checkIfAdmin = require('./checkIfAdmin.js');
const { MessageMedia } = require('whatsapp-web.js');
var clc = require("cli-color");



async function groupHandeler(client, message, chat) {
  try{
  const mentions = await getMentionsArray(message);
  for (const mention of mentions) {
    if (mention === client.info.me._serialized) {
      let quoted = await message.getQuotedMessage();
      if (message.type == "image" || message.type == "video") {
        const media = await message.downloadMedia();
        message.reply(media, undefined, {
          sendMediaAsSticker: true,
          stickerAuthor: "",
          stickerName: "Sticker Bot ^_^"
        });
        break;
        //if quoted is of type image/video - turn it into a sticker
      } else if (message.hasQuotedMsg == false) {
        if (await checkIfAdmin(client, chat, message)) {
          const messageContent = message.body.split("@972557201917 ")[1];
          if (messageContent == undefined || messageContent == " ") {
            //if text is only the mention, check if an admin wants to tag all members of the group.
          } else if (messageContent.toLowerCase() == "everyone") {
            mentionEveryone(client, chat, message);
          } else if (messageContent.toLowerCase() == "69") {
            message.reply("Nice.")
          }
        }
        break;
      } else if (quoted.type == "image" || quoted.type == "video"){
        //download the media
        const media = await quoted.downloadMedia();
        //send it as a sticker
        quoted.reply(media, undefined, {
          sendMediaAsSticker: true,
          stickerAuthor: "",
          stickerName: "Sticker Bot ^_^"
        });
        break;
          //if quoted is of type chat - make an image out of it then turn it into a sticker
      } else if (quoted.type == "chat") {
        const text = quoted.body;
        //turn text into an image
        const stickerData = await textToImage(text);
        if (stickerData == "TextTooLong") {
          await message.reply("*Text is too long. The maximum length supported is 170 characters.*")
        } else {
          const imageSticker = await new MessageMedia("image/png", stickerData);

          await chat.sendMessage(imageSticker, {
            sendMediaAsSticker: true,
            stickerAuthor: "",
            stickerName: "Sticker Bot ^_^"
          });
          break;
        }
      } else if (quoted.type == "sticker") {
        let media = await quoted.downloadMedia();
        quoted.reply(media);
        break;
      }

      }

    }
  } catch (err) {
    console.log(clc.red(err));
  }
  }

async function getMentionsArray(message) {
  if (typeof(message.mentionedIds[0]) === "object") {
    return await message.mentionedIds.map(mantion => mantion._serialized)
  }
  return await message.mentionedIds
}

module.exports = groupHandeler;
