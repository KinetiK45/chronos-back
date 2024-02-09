const mysql = require("mysql2");
const fs = require("fs");
const config_db = JSON.parse(
    fs.readFileSync('./config.json', 'UTF-8')
);

const pool = mysql.createPool({
    connectionLimit: 10,
    host: config_db.host,
    user: config_db.user,
    password: config_db.password,
    database: config_db.database,
}).promise();

module.exports =  pool;