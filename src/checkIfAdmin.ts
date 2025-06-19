import clc from "cli-color";
import { GroupChat, Message, Client } from "whatsapp-web.js";

const checkIfAdmin = async (client: Client, chat: GroupChat, message: Message): Promise<boolean> => {
  try {
    const authorId = message.author || message.from;
    const participant = chat.participants.find(p => p.id._serialized === authorId);
    return participant?.isAdmin || participant?.isSuperAdmin || false;
  } catch (err) {
    console.log(clc.red(String(err)));
    return false;
  }
};

export default checkIfAdmin;
