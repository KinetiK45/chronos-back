const Router = require('express')
const router = new Router;
const eventController = require("../controllers/EventsController")
const token_controller = require("../controllers/TokenController");

router.post('/new_events', token_controller.verifyToken, eventController.createEvents);
router.post('/set_notification', token_controller.verifyToken, eventController.setNotification);
router.get('/byCalendarPeriod/:calendar_id', token_controller.verifyToken, eventController.getAllByMonth);
router.post("/invite", token_controller.verifyToken, eventController.addUserToEventsByEmail);
router.post('/accept-invitation/:token', eventController.getAcceptionEvent);
router.patch('/edit',token_controller.verifyToken, eventController.editEvents);
router.delete('/:id/delete', eventController.deleteEvents);

module.exports = router