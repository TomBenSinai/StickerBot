export const MAX_TEXT_LENGTH = 170

export class NonStickerableItemError extends Error {
  constructor(message = "This item is not stickerable") {
    super(message);
    this.name = "NonStickerableItemError";
  }
}

export class StringTooLongForSticker extends NonStickerableItemError {
  length: number;
  max: number;
  cause: string;

  constructor(length: number, message = `*Text is too long ^_^. The maximum length supported is ${MAX_TEXT_LENGTH} characters.*`) {
    super(message);
    this.length = length;
    this.max = MAX_TEXT_LENGTH;
    this.name = "StringTooLongForSticker";
    this.cause = `Text is too long to be a sticker`;
  }
}
