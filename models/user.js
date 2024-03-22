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
        const selectColumns = ['u.id AS user_id', 'u.full_name', 'cu.role'];
        const fromClause = 'calendar_users cu';
        const joinClause = 'LEFT JOIN users u ON cu.user_id = u.id';
        const whereClause = 'cu.calendar_id = ?';

        const query = `
            SELECT ${selectColumns.join(', ')}
            FROM ${fromClause} ${joinClause}
            WHERE ${whereClause}
            UNION ALL
            SELECT u.id    AS user_id,
                   u.full_name,
                   'owner' AS role
            FROM calendars c
                     JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
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

    async findByFullName(user_ids, stringValue) {
        const tableName = 'users';
        const selectColumns = ['e.id', 'e.email', 'e.full_name'];

        const idPlaceholders = user_ids.map(() => '?').join(',');

        const escapedStringValue = pool.escape('%' + stringValue + '%');

        const query = `
        SELECT ${selectColumns.join(', ')}
        FROM ${tableName} e
        WHERE LOWER(full_name) LIKE ${escapedStringValue}
        AND e.id NOT IN (${idPlaceholders})  
        LIMIT 5
    `;

        try {
            console.log(query);
            const [rows] = await pool.execute(query, [...user_ids]);
            console.log(rows);
            return rows;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }


}

module.exports = User;