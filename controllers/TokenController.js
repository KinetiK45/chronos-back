const jwt = require('jsonwebtoken');
const Response = require('../models/response');
const secretYaEby = 'secret key';
const blackStarBurger = new Set();

function generateToken(payload, expires = '24h') {
    const options = {
        expiresIn: expires,
    };
    return jwt.sign(payload, secretYaEby, options);
}

function deactivateToken(req, res) {
    const token = req.headers.authorization ? req.headers.authorization.replaceAll('Bearer ', '') : undefined;
    if (!token) {
        return res.json(new Response(false, 'Отсутствует токен авторизации'));
    }
    if (blackStarBurger.has(token)){
        return res.json(new Response(false, 'Токен уже удален!'));
    }
    blackStarBurger.add(token);
    res.json(new Response(true, 'Токен успешно удален'));
}

function verifyToken(req, res, next) {
    console.log('verification!');
    let token = '';
    try {
        token = req.headers.authorization.replaceAll('Bearer ', '');
    } catch (e){}

    if (!token) {
        return res.status(401).json(new Response(false, 'Отсутствует токен авторизации'));
    }
    if (blackStarBurger.has(token)){
        return res.status(401).json(new Response(false, 'Токен удален!'));
    }

    jwt.verify(token, secretYaEby, (err, decoded) => {
        if (err) {
            return res.status(401).json(new Response(false, 'Недействительный токен'));
        } else {
            req.senderData = decoded;
            next();
        }
    });
}

function verifyLogin(req, res, next) {
    const token = req.params.confirm_token;
    console.log(token);
    jwt.verify(token, secretYaEby, (err, decoded) => {
        if (err) {
            return res.json(new Response(false, 'Недействительный токен'));
        } else {
            req.senderData = decoded;
            next();
        }
    });
}

module.exports = {
    generateToken,
    verifyToken,
    deactivateToken,
    verifyLogin
}

