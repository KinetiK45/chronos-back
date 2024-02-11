const Response = require("../models/response");
const ERRORS = require("./Errors");
const Events = require("../models/events");
const EventUsers = require("../models/event_users");
const {verifyToken} = require("./TokenController");
const nodemailer = require("nodemailer");
const Notification = require('../models/notification');
const axios = require('axios');
const moment = require('moment');
const Calendar = require('../models/calendars')


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
        let events = new EventUsers();
        const period = req.query.period || 'month';
        const {calendar_id} = req.body
        await verifyToken(req, res, async () => {
            const eventsMonth = await events.getByPeriod(req.senderData.id ,period,calendar_id);
            if (eventsMonth && eventsMonth.length > 0 && calendar_id === await events.getDefaultCalendar(req.senderData.id)) {
                const holidays = await getNationalHolidays('LT',period);
                res.json(new Response(true, "All events by" + period, { events: eventsMonth,holidays }));
            }else if(eventsMonth && eventsMonth.length > 0){
                res.json(new Response(true, "All events by" + period, { events: eventsMonth }));
            }
            else {
                res.json(new Response(true, "No events for the current" + period, { events: [] }));
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json(new Response(false, "Internal server error"));
    }
}
/**
на фронте используй для получения геолокации
navigator.geolocation.getCurrentPosition((position) => {
const countryCode = position.coords.countryCode;
});
 */
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
    const { title, startAt, endAt, allDay, category, isNotification, calendars_id} = req.body;
    let eventUser = new EventUsers();
    verifyToken(req, res, async () => {
        try {
            const result = await events.create(title, startAt, endAt, allDay, category);
            await eventUser.create(req.senderData.id, result, calendars_id);
            if(isNotification === true){
                await notification.add(req.senderData.email, result);
            }
            res.json(new Response(true, 'Event create'));
        } catch (error) {
            console.log(error);
            res.json(new Response(false, error.toString()));
        }
    });
}
async function setNotification(req,res) {
    let notification = new Notification();
    const {event_id} = req.body;
    verifyToken(req, res, async () => {
        try {
            await notification.add(req.senderData.email,event_id);
            res.json(new Response(true, 'Notification create'));
        } catch (error) {
            console.log(error);
            res.json(new Response(false, error.toString()));
        }
    });
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
async function addUserToEvents(req,res){
    let eventUser = new EventUsers();
    const {event_id,user_id,calendar_id } =  req.body;
    eventUser.create(user_id,event_id,calendar_id)
            .then((result) => {
                eventUser.find({ id: result })
                    .then(() => {
                        res.json(new Response(true, 'User successfully add'));
                    });
            }).catch((error) => {
            console.log(error);
            res.json(new Response(false, error.toString()));
        });
}



module.exports = {
    createEvents,
    addUserToEvents,
    setNotification,
    getAllByMonth,
}