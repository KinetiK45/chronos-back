const Router = require('express')
const router = new Router;
const calendar = require("../controllers/CalendarController")

router.post('/create',calendar.createCalendar);
router.delete('/delete',calendar.deleteCalendar);
router.patch('/update',calendar.updateCalendar);
router.get('/all',calendar.getAllCalendars);
module.exports = router