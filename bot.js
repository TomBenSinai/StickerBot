const { Client, LocalAuth } = require('whatsapp-web.js');
const clientAuth = require('./auth.js');
const groupHandler = require('./groupHandler.js');
const chatHandler = require('./chatHandler.js');
const test = require('./test.js');
var clc = require("cli-color");



//initializing client and authenticating
const client = clientAuth();

//handling new chat and group messages
client.on('message', async message => {
  try{
    //Get the chat in question
    const chat = await message.getChat();

    //test
    test(client, chat, message);
    //test

    //check if message came from a privet chat or from a group
    if (chat.isGroup) {
      groupHandler(client, message, chat);
    } else {
      chatHandler(client, message, chat)
    }
  } catch (err) {
    console.log(clc.red(err));
  }
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
  // client.initialize();

});

client.initialize();
