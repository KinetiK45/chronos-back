const Router = require('express')
const router = new Router;
const calendar = require("../controllers/CalendarController")
const token_controller = require('../controllers/TokenController');

router.post('/create',token_controller.verifyToken,calendar.createCalendar);
router.delete('/:calendar_id/delete', token_controller.verifyToken, calendar.deleteCalendar);
router.patch('/update', token_controller.verifyToken, calendar.updateCalendar);
router.get('/all', token_controller.verifyToken, calendar.getAllCalendars);
router.get('/:id',token_controller.verifyToken, calendar.getCalendarById);
router.patch('/update_role',token_controller.verifyToken,calendar.updateRole);
// router.delete('/user/delete',token_controller.verifyToken,calendar.deleteUser);
router.get('/users/:calendar_id',token_controller.verifyToken ,calendar.getUserByCalendarId);
router.post("/invite", token_controller.verifyToken, calendar.addUserToCalendarByEmail);
router.post('/accept-invitation/:token',calendar.getAcceptionCalendar);
router.delete('/eject',token_controller.verifyToken, calendar.posholNaxyi);


module.exports = router