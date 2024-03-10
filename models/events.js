const Model = require("./model");
const pool = require("../db");

class Events extends Model{
    constructor() {
        super("events");
    }
    create(title,startAt,endAt,allDay,category,description = null,calendar_id){
        this.title = title;
        this.startAt = startAt;
        this.endAt = endAt;
        this.allDay = allDay;
        this.category = category;
        this.description = description;
        this.calendar_id = calendar_id;
        return this.insert();
    }

    async  hasCalendars(user_id, calendar_id) {
        const tableName = 'calendars';

        const query = `
        SELECT COUNT(*) AS count
        FROM ${tableName} e
        LEFT JOIN calendar_users eu ON e.id = eu.calendar_id
        WHERE (eu.user_id = ? OR e.user_id = ?) AND e.id = ?
        LIMIT 1;
    `;

        try {
            const [rows] = await pool.execute(query, [user_id, user_id, calendar_id]);
            const count = rows[0].count;
            return count > 0; // Возвращает true, если есть хотя бы один календарь, иначе false
        } catch (error) {
            throw error;
        }
    }
}
module.exports = Events;