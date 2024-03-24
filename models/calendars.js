const Model = require("./model");
const pool = require("../db");
class Calendars extends Model {

    constructor() {
        super("calendars");
    }

    create(title,user_id,description= null, color = '#FFFFFF', type = 'own'){
        this.title = title;
        this.user_id = user_id;
        this.description = description;
        this.color = color;
        this.type = type;
        return this.insert();
    }

    async getDefaultCalendar(user_id) {
        const tableName = 'calendars';

        const query = `
            SELECT id
            FROM ${tableName}
            WHERE user_id = ?
              AND type = 'default' LIMIT 1;
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

    async getTable(calendar_id, user_id) {
        const tableName = 'calendars';

        const query = `
            SELECT COUNT(*) AS count
            FROM ${tableName} e
            WHERE e.user_id = ? AND e.id = ?
        `;
        try {
            const [rows] = await pool.execute(query, [user_id, calendar_id]);
            const count = rows[0].count;
            return count > 0;
        } catch (error) {
            throw error;
        }
    }

    async getCalendars(user_id) {
        const tableName = 'calendars';

        const selectColumns = ['e.id', 'e.title', 'e.user_id', 'e.description','e.color','e.type'];

        const query = `
        SELECT ${selectColumns.join(',')} 
        FROM ${tableName} e
        LEFT JOIN calendar_users eu ON e.id = eu.calendar_id
        WHERE eu.user_id = ? OR e.user_id = ?
        LIMIT 10;
    `;
        try {
            const [rows] = await pool.execute(query, [user_id, user_id]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = Calendars;