import qrcode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';
import clc from 'cli-color';
import retrieveNewMessages from './retrieveNewMessages';

function auth(): Client | undefined {
  try {
    const client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      }
    });
    
    client.on('qr', (qr: string) => {
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      console.log(clc.green("Client is up and running!"));
      retrieveNewMessages(client);
    });
    
    return client;
  } catch (err) {
    console.log(clc.red(`Error during authentication: ${err}`));
    return undefined;
  }
}

export default auth;
