export class NonStickerableItemError extends Error {
  constructor(message = "This item is not stickerable") {
    super(message);
    this.name = "NonStickerableItemError";
  }
}

export class StringTooLongForSticker extends NonStickerableItemError {
  length: number;
  cause: string;

  constructor(length: number, message = `*Text is too long ^_^. Please use shorter text for stickers.*`) {
    super(message);
    this.length = length;
    this.name = "StringTooLongForSticker";
    this.cause = `Text is too long to be a sticker`;
  }
}
