const User = require('../models/user');
const Response = require('../models/response');
const token_controller = require('../controllers/TokenController');
const nodemailer = require("nodemailer");
const ERRORS = require('./Errors');
const Calendar = require('../models/calendars');


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'javawebtempmail@gmail.com',
        pass: 'ljgw wsww hvod tkpz'
    }
});

async function register(req, res) {
    let user = new User();
    const {username,password,email,full_name,race,is_vlaDICK} = req.body;
    user.registration(username, password, email,full_name,race,is_vlaDICK,)
        .then((result)=>{
            user.find({id: result})
                .then(()=>{
                    res.json(new Response(true, 'Регистрация успешна'));
                })
            let calendar = new Calendar();
            calendar.create("Default", result,'','#FFFFFF','default');
        }).catch((error)=>{
        console.log(error);
        res.json(new Response(false, error.toString()));
    });
}

async function login(req, res) {
    const { username, password } = req.body;
    let user = new User();
    user.find({username: username}).then((usersFound)=>{
        if (usersFound.length === 0){
            res.json(new Response(false, 'Нет пользователя с такими данными'));
        }
        else if (usersFound[0].password === password){
            const token = token_controller.generateToken(usersFound[0]);
            res.json(new Response(true, 'Успешный вход', {
                user_id: usersFound[0].id,
                role: usersFound[0].role,
                auth_key: token
            }));
        }
        else
            res.json(new Response(false, 'Не правильный пароль!'));
    }).catch((error)=>{
        console.log(error)
        res.json(new Response(false, error.toString()))
    })
}

async function password_reset(req, res) {
    const { email } = req.body;
    let user = new User();
    let find_results = await user.find({email: email});
    if (find_results.length === 0)
        return ERRORS.NOT_FOUND_ERROR(res, 'User');

    const token = token_controller.generateToken({username: find_results[0].username}, '10m');

    const link = `${req.headers.origin}/password-reset/${token}`;
    const mailOptions = {
        to: find_results[0].email,
        subject: 'Password reset',
        html: `<p>Dear ${find_results[0].full_name}.</p>
<p>Your password recovery <a style="font-weight: bold" href="${link}">link</a></p>
<p style="color: red">You have 10 minutes to use it!</p>
<p>If you didn't do this, please ignore this message.</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.json(new Response(false, error.toString()));
        } else {
            res.json(new Response(true, 'Посилання на відновлення паролю було відправлено на вашу пошту'));
        }
    });
}

async function password_reset_confirmation(req, res) {
    try {
        const username = req.senderData.username;
        let user = new User();
        const results = await user.find({username: username});
        if (results.length === 0)
            return ERRORS.NOT_FOUND_ERROR(res, 'user');

        const change_res = await user.updateById({
            id: results[0].id,
            password: req.body.password
        });
        res.json(new Response(true, 'Данные оновлены', change_res));
    } catch (error){
        res.json(new Response(false, error.toString()));
    }
}

module.exports = {
    register,
    login,
    password_reset,
    password_reset_confirmation
}