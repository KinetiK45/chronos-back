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
const Events_Users = require('../models/events_users');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'javawebtempmail@gmail.com',
        pass: 'ljgw wsww hvod tkpz'
    }
});

function convertToDateTime(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Invalid date";
    }
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
}


async function getAllByMonth(req, res) {
    try {
        let events = new Calendar_User();
        const {calendar_id} = req.params;
        const {startAt, endAt} = req.query;
        let user = req.senderData.id;
        console.log({startAt, endAt, user })
        if (!startAt || !endAt || ((convertToDateTime(startAt) || convertToDateTime(endAt)) === "Invalid date")){
            return res.json(new Response(false, 'invalid startAt/endAt params'));
        }
        else {
            const eventsMonth = await events.getByPeriod(convertToDateTime(startAt), convertToDateTime(endAt), calendar_id);
            for (const eventsMonthElement of eventsMonth) {
                const color_found = await events.findColor(eventsMonthElement.calendar_id, eventsMonthElement.creator_id);
                if (color_found)
                    eventsMonthElement.color = color_found;
            }

            if (eventsMonth && eventsMonth.length > 0) {
                res.json(new Response(true, "All events start from " + startAt + " and end " + endAt, {events: eventsMonth}));
            } else {
                res.json(new Response(true, "No events for the from " + startAt + " and end " + endAt, {}));
            }
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
    const events = new Events();
    const notification = new Notification();
    const {title, startAt, endAt, category, isNotification, description, calendar_id, place} = req.body;
    const chat = new Chat();
    const calendar_user = new Calendar_User();
    try {
        if (!(await calendar_user.hasCalendars(req.senderData.id, calendar_id))) {
            return res.json(new Response(false, "It's not your calendar"));
        }
        const user_role = await calendar_user.getUserRole(req.senderData.id, calendar_id);
        if (user_role !== null && user_role !== 'editor') {
        console.log(user_role);
            return res.json(new Response(false, "You don't have enough permissions"));
        }

        let result;
        if (category === "arrangement" || category === "task" || isNotification || category === 'reminder') {
            result = await events.create(title, startAt, endAt, category, description, calendar_id, req.senderData.id, place);
            res.json(new Response(true, 'Event created', result));
            if (isNotification || category === 'reminder') {
                await notification.add(req.senderData.email, result);
            }
            if (await events.getCalendarType(calendar_id) === 'shared' && category === "arrangement" || category === "task") {
                await chat.creat(title, result);
            }
        } else {
            res.json(new Response(false, 'Invalid category'));
        }
    } catch (error) {
        console.log(error);
        res.json(new Response(false, error.toString()));
    }
}


async function editEvents(req,res) {
    let events = new Events();
    const {id, title, startAt, endAt, category, description, place, complete} = req.body;
    if (!id){
        return res.json(new Response(false, 'No id provided'));
    }
    try {
        events.find({id: id}).then((result) => {
            events.updateById({
                id: result[0].id,
                title: title,
                startAt: startAt,
                endAt: endAt,
                category: category,
                description: description,
                place: place,
                complete: complete
            });
            res.json(new Response(true, "Successfully edited"));
        });
    }catch (error) {
        console.log(error);
        res.json(new Response(false, error.toString()));
    }
}

async function deleteEvents(req,res) {
    try {
        let event = new Events();
        const {id} = req.params
        await event.delete({id: id});
        res.json(new Response(true,"mashem xyami"));
    }catch (error) {
        res.json(new Response(false,"poshol naxyi"))
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
        const title =  await event.getEventTitle(decodedToken.event_id);
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
    getAcceptionEvent,
    editEvents,
    deleteEvents
}