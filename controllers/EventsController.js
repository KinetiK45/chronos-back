const Response = require("../models/response");
const Events = require("../models/events");
const Calendar_User = require("../models/calendar_users");
const {generateToken} = require("./TokenController");
const nodemailer = require("nodemailer");
const Notification = require('../models/notification');
const axios = require('axios');
const moment = require('moment');
const Calendar = require('../models/calendars')
const User = require("../models/user");
const {verify} = require("jsonwebtoken");
const Chat = require('../models/chat');
const Type_Events = require('../models/type_events');
const Events_Users = require('../models/events_users');


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'javawebtempmail@gmail.com',
        pass: 'ljgw wsww hvod tkpz'
    }
});

async function getAllByMonth(req, res) {
    try {
        let events = new Calendar_User();
        const period = req.params.period || 'month';
        const calendar_id = req.query;
        console.log(calendar_id)
        let respData = {};
        // if (countryCode && Number.parseInt(calendar_id) === await events.getDefaultCalendar(req.senderData.id)){
        //     respData.events = [];
        //     respData.holidays = await getNationalHolidays(countryCode, period);
        // }

        const eventsMonth = await events.getByPeriod(period, calendar_id);
        if (eventsMonth && eventsMonth.length > 0) {
            respData.events = eventsMonth;
            res.json(new Response(true, "All events by " + period, respData));
        } else {
            res.json(new Response(true, "No events for the current " + period, respData));
        }
    } catch (error) {
        console.error(error);
        res.status(500).json(new Response(false, "Internal server error"));
    }
}
async function getNationalHolidays(countryCode, period) {
    try {
        const year = new Date().getFullYear();
        const response = await axios.get(`https://date.nager.at/api/v2/publicholidays/${year}/${countryCode}`);
        const holidays = response.data;
        let startOfWeek, endOfWeek;

        switch (period) {
            case 'day':
                startOfWeek = moment().toISOString();
                endOfWeek = moment().toISOString();
                break;
            case 'week':
                startOfWeek = moment().startOf('isoWeek').toISOString();
                endOfWeek = moment().endOf('isoWeek').toISOString();
                break;
            case 'month':
                startOfWeek = moment().startOf('month').toISOString();
                endOfWeek = moment().endOf('month').toISOString();
                break;
        }
        return  holidays.filter(holiday => holiday.date >= startOfWeek && holiday.date <= endOfWeek);
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch national holidays');
    }
}

async function createEvents(req, res) {
    let events = new Events();
    let notification = new Notification();
    let type = new Type_Events();
    const {title, startAt, endAt, allDay, category, isNotification, description, calendar_id,place} = req.body;
    let eventUser = new Calendar_User();
    try {
        if (await events.hasCalendars(req.senderData.id, calendar_id) === true) {
            const result = await events.create(title, startAt, endAt, allDay, category,description, calendar_id);
            if (isNotification === true) {
                await notification.add(req.senderData.email, result);
            }
            if (category === "arrangement"){
               await type.create(result,place);
            }else if(category === "task") {
                await type.create(result,"");
            }
            res.json(new Response(true, 'Event create'));
        }
        else {
            res.json(new Response(false, 'its not your calendar'));
        }
    } catch (error) {
        console.log(error);
        res.json(new Response(false, error.toString()));
    }
}

async function setNotification(req,res) {
    let notification = new Notification();
    const {event_id} = req.body;
    try {
        await notification.add(req.senderData.email, event_id);
        res.json(new Response(true, 'Notification create'));
    } catch (error) {
        console.log(error);
        res.json(new Response(false, error.toString()));
    }
}

function sendNotification(userEmail, eventTitle) {
    const mailOptions = {
        to: userEmail,
        subject: 'Напоминание о событии',
        text: `Не забудьте о событии: ${eventTitle}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent: ', info);
        }
    });
}

setInterval(async () => {
    try {
        let notification = new Notification();
        let currentTime = new Date();
        const upcomingEvents = await notification.getUpcomingEvents();
        upcomingEvents.forEach(event => {
            let eventDate = new Date(event.startAt);
            const timeDifference = currentTime - eventDate;
            if (timeDifference > -60000 && timeDifference <= 0) {
                sendNotification(event.user_email, event.title);
                console.log("notification sent");
            } else {
                console.log("poka idesh naxyi");
            }
        });
    } catch (error) {
        console.error(error);
    }
},  60 * 1000);

async function getAcceptionEvent(req,res) {
    try {
        const decodedToken = verify(req.params.token, 'secret key');
        console.log(decodedToken);
        let chat = new Chat();
        let event = new Events();
        let events_users = new Events_Users();
        events_users.create(decodedToken.user_id,decodedToken.event_id)
            .then((result) => {
                events_users.find({ id: result })
                    .then(() => {
                        res.json(new Response(true, 'User successfully add'));
                    });
            }).catch((error) => {
            res.json(new Response(false, error.toString()));
        });
        const title = event.getEventTitle(decodedToken.event_id);
        await chat.creat(title, decodedToken.event_id);
        await event.find({id: decodedToken.event_id}).then((result) => {
            event.updateById({
                id: result,
                type: 'shared'
            });
        });
    } catch (error) {
        console.error(error);
        res.json(new Response(false, error.toString()));
    }
}

async function addUserToEventsByEmail(req,res){
    let user = new User();
    let event  = new Events();
    const {user_id,event_id} = req.body;
    user.find({id: user_id}).then(async (result) => {
        if (result.length === 0) {
            res.json(new Response(false, 'Not found user'));
        } else {
            const title = await event.getEventTitle(event_id);
            const invitationCode = generateToken({user_id, event_id}, '36h');
            if(title != null) {
                const mailOptions = {
                    to: result[0].email,
                    subject: 'Invite',
                    text: `${req.senderData.full_name} invites you to join his event ${title}. Click the link to accept: http://localhost:3001/api/events/accept-invitation/${invitationCode}`
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log('Email sent: ', info);
                    }
                });
                res.json(new Response(true, "Send invitation", {invitationCode}));
            }else {
                res.json(new Response(false, "Not found event"));

            }
        }
    });
}

module.exports = {
    createEvents,
    setNotification,
    getAllByMonth,
    addUserToEventsByEmail,
    getAcceptionEvent
}