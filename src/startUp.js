const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');
var clc = require("cli-color");
const chromePaths = require('chrome-paths');
const retrieveNewMessages = require('./retrieveNewMessages')

const CHROME_PATH = chromePaths.chrome

let sessionData;


function auth() {
    try {
      const client = new Client({
        authStrategy: new LocalAuth ({
          client: sessionData
        }),
        puppeteer: {
          headless: false,
          executablePath: CHROME_PATH 
        }
      });
  client.on('qr', qr => {
      qrcode.generate(qr, {small: true});
  });

  client.on('ready', () => {
    console.log(clc.green("Client is up and running!"));
    retrieveNewMessages(client)
  })
  return client;
  }
    catch(err) {
        console.log(`error: ${err}`)
        console.log("ksdflkj")
    }
}

module.exports = auth;
