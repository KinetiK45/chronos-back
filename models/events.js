const Model = require("./model");

class Events extends Model{
    constructor() {
        super("events");
    }
    create(title,startAt,endAt,allDay,category){
        this.title = title;
        this.startAt = startAt;
        this.endAt = endAt;
        this.allDay = allDay;
        this.category = category;
        return this.insert();
    }
}
module.exports = Events;