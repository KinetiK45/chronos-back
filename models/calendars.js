const Model = require("./model");
const pool = require("../db");
class Calendars extends Model {
    constructor() {
        super("calendars");
    }
    create(title,user_id,description= null){
        this.title = title;
        this.user_id = user_id;
        this.description = description;
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

    async getCalendars(user_id) {
        const tableName = 'calendars';

        const selectColumns = ['e.id', 'e.title', 'e.user_id', 'e.description'];

        const query = `
            SELECT ${selectColumns.join(',')} 
            FROM ${tableName} e        
            JOIN event_users eu ON e.user_id = eu.user_id 
            JOIN users u ON eu.user_id = u.id
            LIMIT 10;
        `;
        try {
            const [rows] = await pool.execute(query,[user_id]);
            console.log(rows);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = Calendars;