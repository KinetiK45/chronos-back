const pool = require('../db');
const Model = require("./model");

class Notification extends Model{
    constructor() {
        super("notifications");
    }
    add(user_email,event_id){
        this.user_email = user_email;
        this.event_id = event_id;
        return this.insert();
    }
    async getUpcomingEvents() {
        const tableName = 'events';

        const selectColumns = ['e.id', 'e.title', 'e.startAt', 'e.endAt', 'e.allDay', 'e.category', 'u.email as user_email'];

        const whereClauses = [
            'e.startAt > NOW()',
            'DATE(e.startAt) = CURDATE()'
        ];

        const query = `
        SELECT ${selectColumns.join(', ')}
        FROM ${tableName} e
        JOIN notifications n ON e.id = n.event_id
        JOIN users u ON n.user_email = u.email
        WHERE ${whereClauses.join(' AND ')}
        ORDER BY e.startAt
        LIMIT 10;
    `;
        try {
            const [rows] = await pool.execute(query);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = Notification;