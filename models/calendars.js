const Model = require("./model");
const pool = require("../db");
class Calendars extends Model {
    constructor() {
        super("calendars");
    }
    create(title,user_id){
        this.title = title;
        this.user_id = user_id;
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
}
module.exports = Calendars;