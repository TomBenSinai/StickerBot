var clc = require("cli-color");


async function mentionEveryone(client, chat, message) {
  try{

        let mentions = [];
        for(let participant of chat.participants) {
//            const contact = await client.getContactById(participant.id._serialized);
            mentions.push(participant.id._serialized);
//            text += `@${participant.id.user} `;
        }
        mentions.push(message.author)
        const num = client.getContactById(message.author).number
        const text = `_*An admin has tagged you all*_`;

         await chat.sendMessage(text, { mentions });
       } catch (err) {
         console.log(clc.red(err));
       }
}

module.exports = mentionEveryone
