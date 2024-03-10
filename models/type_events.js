const Model = require("./model");

class Type_events extends Model{
    constructor() {
        super("type_events");
    }
    async create(events_id, place, complete = false) {
        this.events_id = events_id;
        this.place = place;
        this.complete = complete;
        return this.insert();
    }
}

module.exports = Type_events;