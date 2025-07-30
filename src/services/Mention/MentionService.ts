import { GroupChat } from "whatsapp-web.js";
import { IMentionService } from "../../types/BotConfig";
import { DEFAULT_OPTIONS, MentionOptions } from "./defaults";

export class MentionService implements IMentionService {
  mentionText: string;
  
  constructor(options: MentionOptions) {
    this.mentionText = options.text ?? DEFAULT_OPTIONS.text;
  }

  async mentionEveryone(chat: GroupChat): Promise<void> {
    try {
      const mentions: string[] = [];
      for (let participant of chat.participants) {
        mentions.push(participant.id._serialized);
      }

      await chat.sendMessage(this.mentionText, { mentions });
    } catch (err) {
      console.warn("Error while mentioning everyone:", err);
    }
  }
} 
