const MAX_TEXT_LENGTH = 170

class NonStickerableItemError extends Error {
  constructor(message = "This item is not stickerable") {
    super(message);
    this.name = "NonStickerableItemError";
  }
}

class StringTooLongForSticker extends NonStickerableItemError {
    constructor(length, message=`*Text is too long ^_^. The maximum length supported is ${MAX_TEXT_LENGTH} characters.*`) {
    super(message);
    this.length = length;
    this.max = MAX_TEXT_LENGTH;
    this.name = "StringTooLongForSticker";
    this.cause = `Text is too long to be a sticker`;
  }
}

module.exports = {
    StringTooLongForSticker,
    MAX_TEXT_LENGTH
 }
