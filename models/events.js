const Model = require("./model");
const pool = require("../db");

class Events extends Model{
    constructor() {
        super("events");
    }
    create(title, startAt, endAt, category, description = ' ', calendar_id, creator_id, place = ' ', complete = false){
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

    async getCalendarType(calendar_id) {
        const tableName = 'calendars';

        const selectColumns = ['e.type']

        const whereClauses = [
            'e.id = ?',
        ]

        const query = `
        SELECT ${selectColumns.join(', ')}
        FROM ${tableName} e
        WHERE ${whereClauses.join(' AND ')}
        `;

        try {
            const [rows] = await pool.execute(query, [calendar_id]);
            if (rows.length > 0) {
                return rows[0].type;
            } else {
                return null;
            }
        } catch (error) {
            throw error;
        }
    }
}
module.exports = Events;