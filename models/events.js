const Model = require("./model");

class Events extends Model{
    constructor() {
        super("events");
    }
    create(title,startAt,endAt,allDay,category,color = '#ABABAB',description = null,calendar_id){
        this.title = title;
        this.startAt = startAt;
        this.endAt = endAt;
        this.allDay = allDay;
        this.category = category;
        this.color = color;
        this.description = description;
        this.calendar_id = calendar_id;
        return this.insert();
    }
}
module.exports = Events;