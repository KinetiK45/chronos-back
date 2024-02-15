const Model = require("./model");

class Chat extends Model {
    constructor() {
        super("chats");
    }
    creat(calendar_id) {
        this.calendar_id = calendar_id;
        return this.insert();
    }
}

module.exports = Chat;