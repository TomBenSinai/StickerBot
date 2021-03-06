const { Client, LocalAuth } = require('whatsapp-web.js');
const clientAuth = require('./auth.js');
const groupHandler = require('./groupHandler.js');
const chatHandler = require('./chatHandler.js');
const test = require('./test.js');


//initializing client and authenticating
const client = clientAuth();

//handling new chat and group messages
client.on('message', async message => {
  try{
    const chat = await message.getChat();

    test(client, chat, message);

    if (chat.isGroup) {
      groupHandler(client, message, chat);
    } else {
      chatHandler(client, message, chat)
    }
  } catch (err) {
    console.log(err);
  }
});
client.initialize();
