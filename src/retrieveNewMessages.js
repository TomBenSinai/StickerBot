const groupHandler = require("./groupHandler")
const chatHandler = require("./chatHandler")

async function retrieveNewMessages(client) {
  try{
    let chats = await client.getChats();
    for (let chat of chats){
      if( chat.unreadCount > 0){
        chat.sendSeen()
        unreadMessages = await chat.fetchMessages( {limit: chat.unreadCount} );
        for (const message of unreadMessages ) {
          if (chat.isGroup) {
            groupHandler(client, message, chat);
          } else {
            chatHandler(client, message, chat)
          }
        }
    }
  }
}
catch(err) {
  console.log(err)
}


}

module.exports = retrieveNewMessages;
