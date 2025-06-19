import { Client, Message, GroupChat, Chat } from 'whatsapp-web.js';
import clientAuth from './startUp';
import groupHandler from './groupHandler';
import chatHandler from './chatHandler';
import { StringTooLongForSticker } from './utils';
import clc from 'cli-color';

const client = clientAuth();

if (client) {
  client.on('message', async (message: Message) => {
    try {
      const chat: Chat = await message.getChat();
      
      if (chat.isGroup) {
        groupHandler(client, message, chat as GroupChat);
      } else {
        chatHandler(client, message, chat)
      }
    } catch (err) {
      if (err instanceof StringTooLongForSticker) {
        message.reply(err.message)
      }
      console.log(clc.red(String(err)));
    }
  });

  process.on('uncaughtException', (err: Error) => {
    console.log('Caught exception: ' + err);
  });

  client.initialize();
} else {
  console.log(clc.red("Failed to initialize client"));
}
