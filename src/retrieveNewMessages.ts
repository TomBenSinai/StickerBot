import groupHandler from "./groupHandler";
import chatHandler from "./chatHandler";
import { Client, Message, Chat, GroupChat } from "whatsapp-web.js";

async function retrieveNewMessages(client: Client): Promise<void> {
  try {
    const chats: Chat[] = await client.getChats();
    for (const chat of chats) {
      if (chat.unreadCount > 0) {
        chat.sendSeen();
        const unreadMessages: Message[] = await chat.fetchMessages({ limit: chat.unreadCount });
        for (const message of unreadMessages) {
          if (chat.isGroup) {
            groupHandler(client, message, chat as GroupChat);
          } else {
            chatHandler(client, message, chat);
          }
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}

export default retrieveNewMessages;
