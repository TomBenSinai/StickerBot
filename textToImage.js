const textToImage = require('text-to-image');
const {UltimateTextToImage} = require("ultimate-text-to-image");


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
       fontSize = Math.floor(scale(textLength, 1, 100, 185, 85));


    //creating the image from the text
    let dataUri = new UltimateTextToImage(text, {
      width: 700,
      fontFamily: "Ploni ML v2 AAA, Arial, MS UI Gothic",
      fontSize: fontSize,
      strokeSize: 5,
      strokeColor: "#000000",
      fontColor: "#ffffff",
      align: "center",
      valign: "middle",
      margin: 5
    }).render().toBuffer().toString("base64");
    return dataUri;
} catch (err) {
  console.log(err);
}
};

module.exports = textToImageFun
