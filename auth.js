const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
var clc = require("cli-color");


let sessionData;


function auth() {
  const client = new Client({
    authStrategy: new LocalAuth ({
      client: sessionData
    }),
    puppeteer: {
      headless: false,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    }
  });

  client.on('qr', qr => {
      qrcode.generate(qr, {small: true});
  });

  client.on('ready', () => {
    console.log(clc.green("Client is up and running!"));
  })
  return client;
}

module.exports = auth;
