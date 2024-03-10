const Calendar = require("../models/calendars");
const Response = require("../models/response");
const User = require("../models/user");
const Calendar_User = require('../models/calendar_users');
const {generateToken} = require("./TokenController");
const {verify} = require("jsonwebtoken");
const Chat = require("../models/chat");
const nodemailer = require("nodemailer");
const Event = require("../models/events");
const Events_Users = require("../models/events_users");

async function createCalendar(req,res) {
    let calendar = new Calendar();
    const {title, description,color} = req.body;

    calendar.create(title, req.senderData.id, description,color).then((result) => {
        calendar.find({id: result})
            .then(() => {
                res.json(new Response(true, 'Calendar successfully create'));
            });
    }).catch((error) => {
        console.log(error);
        res.json(new Response(false, error.toString()));
    });
}

async function getCalendarById(req,res) {
    try {
        const calendar_id = req.params.id;
        console.log(calendar_id);
        let calendar = new Calendar();
        const calendars = await calendar.find({id: calendar_id});
        res.json(new Response(true, "calendar", {calendar: calendars}));
    }catch (error) {
        console.log(error);
        res.json(new Response(false, error.toString()));
    }
}

async function getAllCalendars(req,res) {
    try {
        let calendars = new Calendar();
        console.log(req.senderData.id);
        const allCalendars = await calendars.getCalendars(req.senderData.id);
        res.json(new Response(true, "all calendars", allCalendars));
    } catch (error) {
        console.log(error);
        res.json(new Response(false, error.toString()));
    }
}

async function deleteCalendar(req,res) {
    try {
        let calendar = new Calendar();
        const {calendar_id} = req.body;
        if(calendar_id === await calendar.getDefaultCalendar(req.senderData.id)) {
            res.json(new Response(false, "You cannot delete default calendar"));
        }else {
            await calendar.delete({id: calendar_id });
            res.json(new Response(true, 'Calendar successfully delete'));
        }
    }catch (error){
        console.log(error);
        res.json(new Response(false, error.toString()));
    }
}

async function updateCalendar(req,res){
    try {
        let calendar = new Calendar();
        let shared_calendar = new Calendar_User();
        const {calendar_id , title,description, color} = req.body;
        if(await calendar.getTable(calendar_id,req.senderData.id) === true) {
            const result = calendar.find({id: calendar_id});
            if (result[0].id === await calendar.getDefaultCalendar(req.senderData.id)) {
                res.json(new Response(false, "You cannot change default calendar"));
            } else {
                await calendar.updateById({
                    id: result[0].id,
                    title: title,
                    description: description,
                    color: color
                });
                res.json(new Response(true, 'Calendar successfully update'));
            }
        }else {
            const result = shared_calendar.find({user_id: req.senderData.id,calendar_id: calendar_id})
            await shared_calendar.updateById({
                id: result[0].id,
                custom_color: color
            })
        }
    }catch (error){
        console.log(error);
        res.json(new Response(false, error.toString()));
    }
}

async function getUserByCalendarId(req,res){
    let {calendar_id } = req.params.calendar_id;
    let user = new User();
    const result = await user.getUserByCalendarId(calendar_id);
    if(result != null) {
        res.json(new Response(true, "users", result));
    }else {
        res.json(new Response(false, "not found"));
    }
}

async function addUserToCalendarByEmail(req, res) {
    let eventUser = new Calendar_User();
    let user = new User();
    const {user_id, calendar_id} = req.body;
    user.find({id: user_id}).then(async (result) => {
        if (result.length === 0) {
            res.json(new Response(false, 'Not found user'));
        } else if (calendar_id === await eventUser.getDefaultCalendar(req.senderData.id)) {
            res.json(new Response(false, 'You cannot share the default calendar'));
        } else {
            const invitationCode = generateToken({user_id, calendar_id}, '36h');
            const title = await eventUser.getCalendarTitle(req.senderData.id, calendar_id);
            const mailOptions = {
                to: result[0].email,
                subject: 'Invite',
                text: `${req.senderData.full_name} invites you to join his calendar ${title}. Click the link to accept: http://localhost:3001/api/calendar/accept-invitation/${invitationCode}`
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                } else {
                    console.log('Email sent: ', info);
                }
            });
            res.json(new Response(true, "Send invitation", {invitationCode}));
        }
    });
}

async function getAcceptionCalendar(req,res){
    try {
        const decodedToken = verify(req.params.token, 'secret key');
        console.log(decodedToken);
        let chat = new Chat();
        let calendar_users = new Calendar_User();
        let calendar = new Calendar();
        calendar_users.create(decodedToken.user_id,decodedToken.calendar_id)
            .then((result) => {
                calendar_users.find({ id: result })
                    .then(() => {
                        res.json(new Response(true, 'User successfully add'));
                    });
            }).catch((error) => {
            console.log(error);
            res.json(new Response(false, error.toString()));
        });
        await calendar.find({id: decodedToken.calendar_id}).then((result) => {
            calendar.updateById({
                id: result,
                type: 'shared'
            });
        });
        let events = new Event();
        const events_by_calendar_id = events.getUpcomingEvents(decodedToken.calendar_id);
        if(events_by_calendar_id != null){
            for (const event of events_by_calendar_id ) {
                await chat.creat(event.title,event.id);
                console.log("chat create by event_id " + event.id);
                await events.find({id: event.id}).then((result) => {
                    events.updateById({
                        id: result,
                        type: 'shared'
                    });
                });
            }
        }else {
            res.json(new Response(true,"Don't have any events"));
        }

    } catch (error) {
        console.error(error);
        res.json(new Response(false, error.toString()));
    }
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'javawebtempmail@gmail.com',
        pass: 'ljgw wsww hvod tkpz'
    }
});

module.exports = {
    createCalendar,
    deleteCalendar,
    updateCalendar,
    getAllCalendars,
    getCalendarById,
    getUserByCalendarId,
    addUserToCalendarByEmail,
    getAcceptionCalendar
}