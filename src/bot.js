const { Client, LocalAuth } = require('whatsapp-web.js');
const clientAuth = require('./startUp.js');
const groupHandler = require('./groupHandler.js');
const chatHandler = require('./chatHandler.js');
const utils = require('./utils.js');
var clc = require("cli-color");



const client = clientAuth();

client.on('message', async message => {
  try{
    const chat = await message.getChat();

    if (chat.isGroup) {
      groupHandler(client, message, chat);
    } else {
      chatHandler(client, message, chat)
    }
  } catch (err) {
    if (err instanceof utils.StringTooLongForSticker) {
      message.reply(err.message)
    }
    console.log(clc.red(err));
  }
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);

});

client.initialize();
