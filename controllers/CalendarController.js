const Calendar = require("../models/calendars");
const Response = require("../models/response");
const User = require("../models/user");

async function createCalendar(req,res) {
    let calendar = new Calendar();
    const {title, description} = req.body;

    calendar.create(title, req.senderData.id, description).then((result) => {
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
        const {calendar_id , title,description} = req.body;
        const result = calendar.find({id: calendar_id });
        if(result[0].id === await calendar.getDefaultCalendar(req.senderData.id)) {
            res.json(new Response(false, "You cannot change default calendar"));
        }else {
            await calendar.updateById({
                id: result[0].id,
                title: title,
                description: description
            });
            res.json(new Response(true, 'Calendar successfully update'));
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

module.exports = {
    createCalendar,
    deleteCalendar,
    updateCalendar,
    getAllCalendars,
    getCalendarById,
    getUserByCalendarId
}