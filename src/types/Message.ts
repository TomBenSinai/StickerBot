import { MessageMedia, MessageSendOptions, MessageTypes } from "whatsapp-web.js";

export type ProcessedMessage = {
  media: MessageMedia;
  stickerOptions?: MessageSendOptions;
}

export enum SupportedMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  CHAT = 'chat',
  STICKER = 'sticker'
}

export const isSupportedMediaType = (type: string): type is SupportedMediaType => {
  return Object.values(SupportedMediaType).includes(type as SupportedMediaType);
}

export const isMediaMessage = (type: string): boolean => {
  return type === MessageTypes.IMAGE || type === SupportedMediaType.VIDEO;
}

export const isTextMessage = (type: string): boolean => {
  return type === SupportedMediaType.CHAT;
}

export const isStickerMessage = (type: string): boolean => {
  return type === SupportedMediaType.STICKER;
}

export type MessageProcessor = {
  canProcess: (messageType: string) => boolean;
  process: (message: any, options?: any) => Promise<ProcessedMessage>;
};
