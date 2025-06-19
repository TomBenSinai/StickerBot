import { GroupChat, Message, Client } from "whatsapp-web.js";
import { IAdminService } from "../types/BotConfig";

export class AdminService implements IAdminService {
  
  async isAdmin(client: Client, chat: GroupChat, message: Message): Promise<boolean> {
    try {
      const authorId = message.author || message.from;
      const participant = chat.participants.find(p => p.id._serialized === authorId);
      return participant?.isAdmin || participant?.isSuperAdmin || false;
    } catch (err) {
      console.warn("Error checking admin status:", err);
      return false;
    }
  }
} 
