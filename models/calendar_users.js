const Model = require("./model");
const pool = require("../db");

class Calendar_users extends Model{
    constructor() {
        super("calendar_users");
    }

    async create(user_id, calendar_id, role_id = 2) {
        if (calendar_id === undefined || calendar_id === null) {
            calendar_id = await this.getDefaultCalendar(user_id);
        }
        this.user_id = user_id;
        this.calendar_id = calendar_id;
        this.role_id = role_id;
        return this.insert();
    }

    async getDefaultCalendar(user_id) {
        const tableName = 'calendars';

        const query = `
        SELECT id
        FROM ${tableName}
        WHERE user_id = ? AND type = 'default'
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
    async getCalendarTitle(user_id,calendar_id) {
        const tableName = 'calendars';

        const query = `
        SELECT *
        FROM ${tableName}
        WHERE user_id = ? AND id = ?
        LIMIT 1;
    `;
        try {
            const [rows] = await pool.execute(query, [user_id, calendar_id]);
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

    async findAllColor(calendar_id) {
        const tableName = 'calendar_users';

        const selectColumns = ['e.custom_color']

        const whereClauses = [
            'e.calendar_id = ?',
        ]

        const query = `
        SELECT ${selectColumns.join(', ')}
        FROM ${tableName} e
        left join calendars c on e.id = e.calendar_id
        WHERE ${whereClauses.join(' AND ')}
        LIMIT 3000;
    `;

        try {
            const [rows] = await pool.execute(query,[calendar_id]);
            console.log(rows)
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async findColor(calendar_id, creator_id) {
        const tableName = 'calendar_users';

        const selectColumns = ['e.custom_color']

        const whereClauses = [
            'e.calendar_id = ?',
            'e.user_id = ?'
        ]

        const query = `
        SELECT ${selectColumns.join(', ')}
        FROM ${tableName} e
        WHERE ${whereClauses.join(' AND ')}
        LIMIT 3000;
    `;

        try {
            const [rows] = await pool.execute(query,[calendar_id,creator_id]);
            console.log(rows)
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async getByPeriod(startAt,endAt,calendar_id) {
        const tableName = 'events';

        const selectColumns = ['e.id', 'e.title', 'e.startAt', 'e.endAt','e.calendar_id','e.description', 'e.category','e.place', 'e.creator_id', 'e.complete'];

        const whereClauses = [
            'e.calendar_id = ?',
            'e.startAt >= ?',
            'e.endAt <= ?'
        ];

        const query = `
        SELECT ${selectColumns.join(', ')}
        FROM ${tableName} e
        WHERE ${whereClauses.join(' AND ')}
        LIMIT 3000;
    `;

        try {
            const [rows] = await pool.execute(query,[calendar_id,startAt,endAt]);
            console.log(rows)
            return rows;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = Calendar_users;