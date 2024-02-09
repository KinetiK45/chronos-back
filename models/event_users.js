const Model = require("./model");

class Event_users extends Model{
    constructor() {
        super("event_users");
    }

    add (user_id,event_id){
        this.user_id = user_id;
        this.event_id = event_id;
        return this.insert();
    }
}
module.exports = Event_users;