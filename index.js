const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const router = require('./routers/main');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'http://192.168.1.4:3000'],
    credentials: true,
}));

app.use(
    session({
        secret: 'session secret',
        resave: false,
        saveUninitialized: true
    })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router);
app.use(express.static('images'));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Сервер запущен http://localhost:${PORT}`);
});