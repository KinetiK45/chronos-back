const Model = require("./model");

class Messages extends Model {
    constructor() {
        super('messages');
    }
    create(chat_id,content,sender_id,reply_to = null ) {
        this.chat_id = chat_id;
        this.content = content;
        this.sender_id = sender_id;
        this.reply_to = reply_to;
        return this.insert();
    }
    // reply(chat_id,content,sender_id,reply_to){
    //     this.chat_id = chat_id;
    //     this.content = content;
    //     this.sender_id = sender_id;
    //     this.reply_to = reply_to;
    //     return this.insert();
    // }
}

module.exports = Messages;