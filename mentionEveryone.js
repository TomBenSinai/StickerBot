

async function mentionEveryone(client, chat, message) {
  try{

  let text = "_*An admin has tagged you all*_ " + "\n \n";
        let mentions = [];

        for(let participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);

            mentions.push(contact);
            text += `@${participant.id.user} `;
        }
         await chat.sendMessage(text, { mentions });
       } catch (err) {
         console.log(err);
       }
}

module.exports = mentionEveryone
