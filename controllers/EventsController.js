const Response = require("../models/response");
const ERRORS = require("./Errors");
const Events = require("../models/events");
const EventUsers = require("../models/event_users");
const {verifyToken} = require("./TokenController");
const nodemailer = require("nodemailer");
const {getUpcomingEvents} = require("../db");
const Notification = require('../models/notification');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'javawebtempmail@gmail.com',
        pass: 'ljgw wsww hvod tkpz'
    }
});

async function createEvents(req, res) {
    let events = new Events();
    let notification = new Notification();
    const { title, startAt, endAt, allDay, category } = req.body;
    let eventUser = new EventUsers();
    verifyToken(req, res, async () => {
        const userId = req.senderData.id;
        const user_email = req.senderData.email;
        try {
            const result = await events.create(title, startAt, endAt, allDay, category);
            await eventUser.add(userId, result);
            await notification.add(user_email,result);
            res.json(new Response(true, 'Event create'));
        } catch (error) {
            console.log(error);
            res.json(new Response(false, error.toString()));
        }
    });
}
async function setNotification(req,res) {
    let notification = new Notification();
    const {user_email,event_id} = req.body;
    verifyToken(req, res, async () => {
        const user_email = req.senderData.email;
        try {
            await notification.add(user_email,event_id);
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
        console.log("event" , upcomingEvents)
        upcomingEvents.forEach(event => {
            let eventDate = new Date(event.startAt);
            const timeDifference = currentTime - eventDate;
            console.log(`time diff = ${timeDifference}`)
            if (timeDifference > 0 && timeDifference <= 60_000) {
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
    const {event_id,user_id } =  req.body;
    eventUser.add(user_id,event_id)
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
    setNotification
}