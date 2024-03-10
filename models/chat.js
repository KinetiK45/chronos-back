const Model = require("./model");

class Chat extends Model {
    constructor() {
        super("chats");
    }
    creat(title,event_id) {
        this.title = title;
        this.event_id = event_id;
        return this.insert();
    }
}

module.exports = Chat;