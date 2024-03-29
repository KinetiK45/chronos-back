const Calendar = require("../models/calendars");
const Response = require("../models/response");
const User = require("../models/user");
const Calendar_User = require('../models/calendar_users');
const {generateToken} = require("./TokenController");
const {verify} = require("jsonwebtoken");
const Chat = require("../models/chat");
const nodemailer = require("nodemailer");
const Event = require("../models/events");

async function createCalendar(req,res) {
    let calendar = new Calendar();
    const {title, description, color} = req.body;
    calendar.create(title, req.senderData.id, description, color).then((result) => {
        res.json(new Response(true, 'Calendar successfully create', result));
    }).catch((error) => {
        res.json(new Response(false, error.toString()));
    });
}

async function getCalendarById(req,res) {
    try {
        const calendar_id = req.params.id;
        let calendar = new Calendar();
        let calendars_users = new Calendar_User();
        if (!(await calendars_users.hasCalendars(req.senderData.id, calendar_id))) {
            return res.json(new Response(false, "It's not your calendar"));
        }
        const calendars = await calendar.find({id: calendar_id});
        if (calendars.length === 0){
            return res.json(new Response(false, 'not found'));
        }
        const result = await calendars_users.find({user_id : req.senderData.id, calendar_id: calendar_id});
        if (result.length > 0){
            calendars[0].calendar_user = result[0];
        }
        res.json(new Response(true, "calendar user", calendars[0]));

    }catch (error) {
        res.json(new Response(false, error.toString()));
    }
}

async function getAllCalendars(req,res) {
    try {
        let calendars = new Calendar();
        const allCalendars = await calendars.getCalendars(req.senderData.id);
        res.json(new Response(true, "all calendars", allCalendars));
    } catch (error) {
        res.json(new Response(false, error.toString()));
    }
}

async function deleteCalendar(req,res) {
    try {
        let calendars_users = new Calendar_User();
        let calendar = new Calendar();
        let event = new Event();
        const {calendar_id} = req.params;
        if (!(await calendars_users.hasCalendars(req.senderData.id, calendar_id))) {
            return res.json(new Response(false, "It's not your calendar"));
        }else {
            if(!(await calendar.getTable(calendar_id,req.senderData.id))){
                 calendars_users.find({ calendar_id: calendar_id, user_id: req.senderData.id }).then((result) => {
                     event.find({calendar_id: calendar_id , creator_id: req.senderData.id}).then((results) => {
                         for (const resultElement of results) {
                             if (resultElement.id !== null) {
                                 event.delete({id: resultElement.id});
                             }
                         }
                     });
                     if (result[0].id !== null) {
                         calendars_users.delete({ id: result[0].id });
                     }
                     res.json(new Response(true,"You successfully leave"));
                 })
            }else {
                if(calendar_id === await calendar.getDefaultCalendar(req.senderData.id)) {
                    res.json(new Response(false, "You cannot delete default calendar"));
                }
                else {
                    calendars_users.find({ calendar_id: calendar_id}).then((result) => {
                        if (result.length > 0) {
                            calendars_users.delete({ id: result[0].id });
                        }
                        event.find({calendar_id: calendar_id}).then((results) => {
                            for (const resultElement of results) {
                                if (resultElement.id !== null) {
                                    event.delete({id: resultElement.id});
                                }
                            }
                        })
                        calendar.delete({id: calendar_id });
                    })
                    res.json(new Response(true, 'Calendar successfully delete'));
                }
            }
        }
    }catch (error){
        res.json(new Response(false, error.toString()));
    }
}

async function updateCalendar(req,res){
    try {
        let calendar = new Calendar();
        let shared_calendar = new Calendar_User();
        const {calendar_id , title,description, color} = req.body;
        if(await calendar.getTable(calendar_id, req.senderData.id) === true) {
            const result = await calendar.find({id: calendar_id});
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
            const result = await shared_calendar.find({user_id: req.senderData.id, calendar_id: calendar_id})
            await shared_calendar.updateById({
                id: result[0].id,
                custom_color: color,
                user_id: result[0].user_id,
                calendar_id: calendar_id,
            })
            if(title !== undefined || description !== undefined){
                calendar.find({id: calendar_id}).then((resul) => {
                    calendar.updateById({
                        id: resul[0].id,
                        title: title,
                        description: description
                    });
                });
            }
            res.json(new Response(true,'Calendar successfully update'));
        }
    }catch (error){
        res.json(new Response(false, error.toString()));
    }
}

async function getUserByCalendarId(req,res){
    let {calendar_id } = req.params;
    let user = new User();
    let calendar_user = new Calendar_User();
    if (!(await calendar_user.hasCalendars(req.senderData.id, calendar_id))) {
        return res.json(new Response(false, "It's not your calendar"));
    }
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
                text: `${req.senderData.full_name} invites you to join his calendar ${title}. Click the link to accept: ${req.headers.origin}/accept-invitation/${invitationCode}`
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    res.json(false,"Can't send invitation" + error.message)
                } else {
                    res.json(new Response(true, "Send invitation"));
                }
            });
        }
    });
}

async function getAcceptionCalendar(req,res){
    try {
        console.log(JSON.stringify(req.params.token));
        const decodedToken = verify(req.params.token, 'secret key');
        console.log(decodedToken);
        let chat = new Chat();
        let calendar_users = new Calendar_User();
        let calendar = new Calendar();
        calendar_users.create('#a2a2a2',decodedToken.user_id,decodedToken.calendar_id)
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
                id: result[0].id,
                title: result[0].title,
                user_id: result[0].user_id,
                description: result[0].description,
                color: result[0].color,
                type: 'shared'
            });
        });
        let events = new Event();
        // let events_users = new Events_Users();
        const events_by_calendar_id = await events.getUpcomingEvents(decodedToken.calendar_id);
        console.log("upcoming event" + {events_by_calendar_id});
        if (Array.isArray(events_by_calendar_id)){
            for (const event of events_by_calendar_id ) {
                await chat.creat(event.title,event.id);
                // await events_users.create(decodedToken.user_id,event.id);
            }
        }
    } catch (error) {
        console.error(error);
        res.json(new Response(false, error.toString()));
    }
}

async function updateRole(req,res) {
    let calendars = new Calendar();
    const {calendar_id, user_id, role} = req.body;
    if (await calendars.getTable(calendar_id, req.senderData.id) === true) {
        let calendars_users = new Calendar_User();
        calendars_users.find({calendar_id: calendar_id, user_id: user_id}).then((result) => {
            calendars_users.updateById({
                id: result[0].id,
                role: role
            });
        });
        res.json(new Response(true, "obnovil naxui"));
    } else {
        res.json(new Response(false, "poshol naxyi ne xhataet prav "));
    }
}

// async function deleteUser(req,res){
//     let calendars = new Calendar();
//     const {calendar_id, user_id} = req.body;
//     if (await calendars.getTable(calendar_id, req.senderData.id) === true) {
//         let calendars_users = new Calendar_User();
//         calendars_users.find({calendar_id: calendar_id, user_id: user_id}).then((result) => {
//            calendars_users.delete({id: result[0].id});
//         });
//         res.json(new Response(true, "yvolin naxui"));
//     } else {
//         res.json(new Response(false, "poshol naxyi ne xhataet prav "));
//     }
// }

async function posholNaxyi(req,res) {
    const {calendar_id, user_id} = req.body
    let calendars_users = new Calendar_User();
    let calendar = new Calendar();
    if (!(await calendars_users.hasCalendars(req.senderData.id, calendar_id))) {
        return res.json(new Response(false, "It's not your calendar"));
    }else {
        if(await calendar.getTable(calendar_id,req.senderData.id) === true){
            calendars_users.find({ calendar_id: calendar_id, user_id: user_id }).then((result) => {
                calendars_users.delete({ id: result[0].id });
                res.json(new Response(true,"v strahe ot syda naxyi"));
            });
        }else {
            res.json(new Response(false,"poshel naxyi ne sozdatel"));
        }
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
    getAcceptionCalendar,
    updateRole,
    // deleteUser,
    posholNaxyi
}