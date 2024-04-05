const textToImage = require('text-to-image');
const {UltimateTextToImage} = require("ultimate-text-to-image");
var clc = require("cli-color");



//function for mapping
function scale (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

async function textToImageFun(text) {
  try{
    let fontSize;
    let lineHeight;
    const textLength = text.length;

    //defining font size and line height depending on text lenth
       fontSize = Math.floor(scale(textLength, 1, 100, 300, 120));

    if (textLength > 170) {
      return "TextTooLong"
    }

    //creating the image from the text
    let dataUri = new UltimateTextToImage(text, {
      maxWidth: 1000,
      maxHeight: 1000,
      fontFamily: "Afek 1.5 AAA, Arial, MS UI Gothic",
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
