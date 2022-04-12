const { Client, LocalAuth } = require('whatsapp-web.js');
const clientAuth = require('./auth.js');
const groupHandler = require('./groupHandler.js');
const chatHandler = require('./chatHandler.js');


//initializing client and authenticating
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
    console.log(err);
  }
});
client.initialize();
