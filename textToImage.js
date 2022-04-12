const textToImage = require('text-to-image');


function scale (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

async function textToImageFun(text) {
  try{
    let fontSize;
    let lineHeight;
    const textLength = text.length;
    if (textLength <= 100) {
       fontSize = Math.floor(scale(textLength, 1, 100, 185, 85));
       lineHeight = Math.floor(scale(textLength, 1, 100, 185, 35));
    } else {
      fontSize = 50;
      lineHeight = 50;
    }
    let dataUri = await textToImage.generate(text, {
      maxWidth: 700,
      customHeight: 700,
      fontSize: fontSize,
      textAlign: "center",
      verticalAlign: "center",
      bgColor: "rgba(255, 255, 255, 0)",
      textColor: "#FFFFFF",
      lineHeight: lineHeight,
      fontFamily: "Ploni ML v2 AAA"
    });
    let dataUriSliced = dataUri.slice(22);
    return dataUriSliced;
} catch (err) {
  console.log(err);
}
};

module.exports = textToImageFun
