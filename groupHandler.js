const textToImage = require('./textToImage');
const mentionEveryone = require('./mentionEveryone.js');
const checkIfAdmin = require('./checkIfAdmin.js');
const { MessageMedia } = require('whatsapp-web.js');


async function groupHandeler(client, message, chat) {
  try{
    //gets the mentions in a message, if any.
  const mentions = await message.getMentions();
  //iterate and find if one of the mentions is Sticker Bot.
  for (let i = 0; i < mentions.length; i++) {
    if (mentions[i].id.user == "972557256950") {
      //if Sticker Bot got mentioned, get the quoted message.
      let quoted = await message.getQuotedMessage();
      //if the message message is of type image/video - turn it into a sticker
      if (message.type == "image" || message.type == "video") {
        //download the media
        const media = await message.downloadMedia();
        //send it as a sticker
        message.reply(media, undefined, {
          sendMediaAsSticker: true,
          stickerAuthor: "+972-557256950",
          stickerName: "Sticker Bot ^_^"
        });
        break;
        //if quoted is of type image/video - turn it into a sticker
      } else if (message.hasQuotedMsg == false) {
        if (await checkIfAdmin(client, chat, message)) {
          const messageContent = message.body.split("@972557256950 ")[1];
          if (messageContent == undefined || messageContent == " ") {

          } else if (messageContent.toLowerCase() == "everyone") {
            mentionEveryone(client, chat, message);
          }
        }
        break;
        //if text is only the mention, check if an admin wants to tag all members of the group.
      } else if (quoted.type == "image" || quoted.type == "video"){
        //download the media
        const media = await quoted.downloadMedia();
        //send it as a sticker
        quoted.reply(media, undefined, {
          sendMediaAsSticker: true,
          stickerAuthor: "+972-557256950",
          stickerName: "Sticker Bot ^_^"
        });
        break;
          //if quoted is of type chat - make an image out of it then turn it into a sticker
      } else if (quoted.type == "chat") {
        const text = quoted.body;
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
        break;
      } else if (quoted.type == "sticker") {
        const media = await quoted.downloadMedia();
        console.log(media.mimetype);
        quoted.reply(media);
        break;
      }

      }

    }
  } catch (err) {
    console.log(err);
  }
  }



module.exports = groupHandeler;
