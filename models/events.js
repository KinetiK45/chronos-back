const Model = require("./model");
const pool = require("../db");

class Events extends Model{
    constructor() {
        super("events");
    }
    create(title, startAt, endAt, category, description = null, calendar_id, creator_id, place = null, complete = false){
        this.title = title;
        this.startAt = startAt;
        this.endAt = endAt;
        this.category = category;
        this.description = description;
        this.creator_id = creator_id;
        this.calendar_id = calendar_id;
        this.place = place;
        this.complete = complete;
        return this.insert();
    }

    async getEventTitle(event_id) {
        const tableName = 'events';

        const query = `
        SELECT *
        FROM ${tableName}
        WHERE id = ? 
        LIMIT 1;
    `;
        try {
            const [rows] = await pool.execute(query, [event_id]);
            if (rows.length > 0) {
                console.log(rows[0].title);
                return rows[0].title;
            } else {
                return null;
            }
        } catch (error) {
            throw error;
        }
    }

    async getUpcomingEvents(calendar_id) {
        const tableName = 'events';

        const selectColumns = ['e.id', 'e.title', 'e.startAt', 'e.endAt', 'e.category', 'e.place', 'e.creator_id', 'e.complete'];

        const whereClauses = [
            'e.startAt > NOW()',
            'e.calendar_id = ?'
        ];

        const query = `
        SELECT ${selectColumns.join(', ')}
        FROM ${tableName} e
        WHERE ${whereClauses.join(' AND ')}
        ORDER BY e.startAt
        LIMIT 50;
    `;
        try {
            const [rows] = await pool.execute(query, [calendar_id]);
            return rows;
        } catch (error) {
            throw error;
        }
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
            return count > 0;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = Events;