const pool = require('../db');
const mysql = require("mysql2");
class Model {
    constructor(tableName) {
        this.tableName = tableName;
    }

    async insert() {
        const keys = Object.keys(this)
            .filter((key) => key !== 'tableName');
        const values = keys.map(
            (key) => this[key]
        );
        const placeholders = keys.map(() => '?').join(', ');
        const query = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;

        console.log(query);
        console.log(values);
        try {
            const [result] = await pool.execute(query, values);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    async find(conditions = {}) {
        const whereClauses = [];
        const values = [];

        for (const key in conditions) {
            whereClauses.push(`${key} = ?`);
            values.push(conditions[key]);
        }

        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const query = `SELECT * FROM ${this.tableName} ${whereClause}`;

        try {
            const [rows] = await pool.execute(query, values);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async find_with_sort(conditions = {}) {
        const { join, group, field, order, size, page, filters } = conditions;
        const whereClauses = [];
        const values = [];

        for (const key in conditions) {
            if (!['join', 'group', 'field', 'order', 'size', 'page', 'filters'].includes(key)) {
                whereClauses.push(`${key} = ?`);
                values.push(conditions[key]);
            }
        }

        if (Array.isArray(filters)) {
            filters.forEach(filter => {
                whereClauses.push(filter);
            });
        }

        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const orderClause = field && order ? `ORDER BY ${field} ${order}` : '';
        const limitClause = size && page ? `LIMIT ${size} OFFSET ${(page - 1) * size}` : '';

        const countQuery = `SELECT COUNT(*) as count FROM (${join ? join : `SELECT * FROM ${this.tableName}`} ${whereClause} ${group ? group : ''}) AS subquery`;
        const dataQuery = `${join ? join : `SELECT * FROM ${this.tableName}`} ${whereClause} ${group ? group : ''} ${orderClause} ${limitClause}`.replaceAll('  ', ' ');

        try {
            const [countResult] = await pool.execute(countQuery, values);
            const totalCount = countResult[0].count;

            const [rows] = await pool.execute(dataQuery, values);
            console.log(dataQuery);

            const totalPages = Math.ceil(totalCount / size);
            const currentPage = page || 1;

            return { rows, totalCount, totalPages, currentPage };
        } catch (error) {
            throw error;
        }
    }



    async delete(conditions = {}) {
        const whereClauses = [];
        const values = [];

        for (const key in conditions) {
            whereClauses.push(`${key} = ?`);
            values.push(conditions[key]);
        }

        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const query = `DELETE FROM ${this.tableName} ${whereClause}`;

        try {
            const [result] = await pool.execute(query, values);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    async updateById(updatedFields) {
        const keys = Object.keys(updatedFields).filter(key => key !== 'id');
        const setClauses = keys.map(key => `${key} = ?`).join(', ');
        const values = keys.map(key => updatedFields[key]);

        if (!updatedFields.id) {
            throw new Error('Не указан идентификатор (id) для обновления записи.');
        }

        const query = `UPDATE ${this.tableName} SET ${setClauses} WHERE id = ?`;
        values.push(updatedFields.id);

        console.log(query);
        console.log(values);

        try {
            const [result] = await pool.execute(query, values);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Model;