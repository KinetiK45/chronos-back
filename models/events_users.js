const Model = require("./model");

class Events_users extends Model {
    constructor() {
        super("events_users");
    }

    create(user_id,event_id) {
        this.user_id = user_id;
        this.event_id = event_id;
        return this.insert();
    }
}
module.exports = Events_users;