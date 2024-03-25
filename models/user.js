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
// kak mena eto zaebalo
    async getUserByCalendarId(calendar_id) {
        const query = `
        SELECT u.id AS user_id, u.full_name, cu.role, cu.custom_color AS color
        FROM calendar_users cu LEFT JOIN users u ON cu.user_id = u.id
        WHERE cu.calendar_id = ?
        UNION ALL
        SELECT u.id AS user_id,
               u.full_name,
               'owner' AS role,
               c.color AS color 
        FROM calendars c
                 JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
    `;
        try {
            const [rows] = await pool.execute(query, [calendar_id, calendar_id]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async findByFullName(user_ids_to_exclude, stringValue) {
        const tableName = 'users';
        const selectColumns = ['e.id', 'e.email', 'e.full_name'];

        const idPlaceholders = user_ids_to_exclude.map(() => '?').join(',');

        const escapedStringValue = pool.escape('%' + stringValue + '%');

        const query = `
        SELECT ${selectColumns.join(', ')}
        FROM ${tableName} e
        WHERE LOWER(full_name) LIKE ${escapedStringValue}
        AND e.id NOT IN (${idPlaceholders})
        LIMIT 5
    `;

        try {
            const [rows] = await pool.execute(query, [...user_ids_to_exclude]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;