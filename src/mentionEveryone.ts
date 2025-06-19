import clc from "cli-color";
import { Client, GroupChat, Message } from "whatsapp-web.js";

async function mentionEveryone(client: Client, chat: GroupChat, message: Message): Promise<void> {
  try {
    const mentions: string[] = [];
    for (let participant of chat.participants) {
      mentions.push(participant.id._serialized);
    }
    const text = `_*An admin has tagged you all*_`;

    await chat.sendMessage(text, { mentions });
  } catch (err) {
    console.log(clc.red(String(err)));
  }
}

export default mentionEveryone;
