const Router = require('express')
const router = new Router;
const calendar = require("../controllers/CalendarController")
const token_controller = require('../controllers/TokenController');

router.post('/create',token_controller.verifyToken,calendar.createCalendar);
router.delete('/delete',calendar.deleteCalendar);
router.patch('/update',calendar.updateCalendar);
router.get('/all', token_controller.verifyToken, calendar.getAllCalendars);
router.get('/:id',calendar.getCalendarById);
router.get('users/:calendar_id',calendar.getUserByCalendarId);
router.post("/invite", token_controller.verifyToken, calendar.addUserToCalendarByEmail);
router.post('/accept-invitation/:token',calendar.getAcceptionCalendar);

module.exports = router