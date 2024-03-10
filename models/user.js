const Model = require("./model");
const pool = require("../db");

class User extends Model {
    constructor() {
        super("users");
    }
    registration(username, password, email, full_name,race = "istribitel mig-28 v sovershenstve", is_vlaDICK = true){
        this.username = username;
        this.password = password;
        this.email = email;
        this.full_name = full_name;
        this.race = race;
        this.is_vlaDICK = is_vlaDICK;
        return this.insert();
    }

    async getUserByCalendarId(calendar_id) {
        const tableName = 'calendars';

        const selectColumns = ['e.id', 'e.title', 'e.user_id', 'e.description','e.type'];

        const query = `
        SELECT ${selectColumns.join(',')} 
        FROM ${tableName} e
        LEFT JOIN calendar_users eu ON e.user_id = eu.user_id
        WHERE eu.id = ? OR e.calendar_id = ?
        LIMIT 10;
    `;
        try {
            console.log(query);
            const [rows] = await pool.execute(query, [calendar_id, calendar_id]);
            console.log(rows);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = User;