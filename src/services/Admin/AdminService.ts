import { GroupChat, Message } from "whatsapp-web.js";
import { IAdminService } from "../../types/BotConfig";

export class AdminService implements IAdminService {
  
  async isAdmin(chat: GroupChat, message: Message): Promise<boolean> {
      const authorId = message.author || message.from;
      const participant = chat.participants.find(p => p.id._serialized === authorId);
      return participant?.isAdmin || participant?.isSuperAdmin || false;
  }
} 
