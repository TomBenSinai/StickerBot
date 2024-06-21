var clc = require("cli-color");



async function checkIfAdmin(client, chat, message) {

  try{
    const fromWho = await message.getContact();
    const parts = await chat.participants;
    // console.log(fromWho.id.user);
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].isAdmin) {
        // console.log(parts[i].id.user);
        if (fromWho.id.user == parts[i].id.user) {
          return true;
          break;
        }
      } else {
        if (i == parts.length - 1) {
                return false;
            }
      }
    }

  } catch (err) {
    console.log(clc.red(err));
  }
}

module.exports = checkIfAdmin;
