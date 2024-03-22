const Model = require("./model");
const pool = require("../db");
const e = require("express");

class Calendar_users extends Model{
    constructor() {
        super("calendar_users");
    }

    async create(custom_color,user_id,calendar_id, role = 'inspector') {
        this.custom_color = custom_color;
        this.user_id = user_id;
        this.calendar_id = calendar_id;
        this.role = role;
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
                return rows[0].title;
            } else {
                return null;
            }
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
        LIMIT 1;
    `;

        try {
            const [rows] = await pool.execute(query,[calendar_id,creator_id]);
            if (rows.length !== 0)
                return rows[0].custom_color;
            return undefined;
        } catch (error) {
            return undefined;
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
            return rows;
        } catch (error) {
            throw error;
        }
    }
    async getUserRole(user_id, calendar_id) {
        const tableName = 'calendar_users';

        const selectColumns = ['e.role']

        const whereClauses = [
            'e.calendar_id = ?',
            'e.user_id = ?'
        ]

        const query = `
            SELECT ${selectColumns.join(', ')}
            FROM ${tableName} e
            WHERE ${whereClauses.join(' AND ')}
                LIMIT 1;
        `;

        try {
            const [rows] = await pool.execute(query,[calendar_id,user_id]);
            if(rows.length > 0){
                return rows[0].role;
            }else {
                return null;
            }
        } catch (error) {
            return error;
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
module.exports = Calendar_users;