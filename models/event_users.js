const Model = require("./model");
const pool = require("../db");

class Event_users extends Model{
    constructor() {
        super("event_users");
    }

    async create(user_id, event_id, calendar_id) {
        if (calendar_id === undefined || calendar_id === null) {
            calendar_id = await this.getDefaultCalendar(user_id);
        }
        this.user_id = user_id;
        this.event_id = event_id;
        this.calendar_id = calendar_id;
        return this.insert();
    }
    async getDefaultCalendar(user_id) {
        const tableName = 'calendars';

        const query = `
        SELECT id
        FROM ${tableName}
        WHERE user_id = ? AND title = 'Calendar'
        LIMIT 1;
    `;
        try {
            const [rows] = await pool.execute(query, [user_id]);
            if (rows.length > 0) {
                return rows[0].id;
            } else {
                return null;
            }
        } catch (error) {
            throw error;
        }
    }

    async getByPeriod(user_id,period,calendar_id) {
        const tableName = 'events';

        const selectColumns = ['e.id', 'e.title', 'e.startAt', 'e.endAt', 'e.allDay', 'e.category'];

        const whereClauses = [
            'eu.user_id = ?',
            'eu.calendar_id = ?'
        ];

        switch (period) {
            case 'day':
                whereClauses.push('DATE(e.startAt) = CURDATE()');
                break;
            case 'week':
                whereClauses.push('YEARWEEK(e.startAt, 1) = YEARWEEK(CURDATE(), 1)');
                break;
            case 'month':
                whereClauses.push('MONTH(e.startAt) = MONTH(CURDATE())');
                break;
        }

        const query = `
        SELECT ${selectColumns.join(', ')}
        FROM ${tableName} e
        JOIN event_users eu ON e.id = eu.event_id  
        JOIN user u ON eu.user_id = u.id
        WHERE ${whereClauses.join(' AND ')}
        LIMIT 30;
    `;

        try {
            const [rows] = await pool.execute(query,[user_id,calendar_id]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = Event_users;