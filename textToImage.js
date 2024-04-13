const textToImage = require('text-to-image');
const {UltimateTextToImage, registerFont} = require("ultimate-text-to-image");
var clc = require("cli-color");


registerFont("./assets/fonts/font.ttf")

async function textToImageFun(text) {
  try{
    
    if (text.length > 170) {
      return "TextTooLong"
    }

    //creating the image from the text
    let dataUri = new UltimateTextToImage(text, {
      maxWidth: 1000,
      maxHeight: 1000,
      fontFamily: "Afek 1.5 AAA, arial",
      fontSize: 300,
      minFontSize: 120,
      strokeSize: 6,
      strokeColor: "#000000",
      fontColor: "#ffffff",
      align: "center",
      alignToCenterIfLinesLE: 1,
      margin: 15,
    }).render().toBuffer().toString("base64");
    return dataUri;
} catch (err) {
  return "TextTooLong"
}
};

module.exports = textToImageFun
