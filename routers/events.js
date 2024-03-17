const Router = require('express')
const router = new Router;
const eventController = require("../controllers/EventsController")
const token_controller = require("../controllers/TokenController");

router.post('/new_events', token_controller.verifyToken, eventController.createEvents);
router.post('/set_notification', token_controller.verifyToken, eventController.setNotification);
router.get('/byPeriod/:calendar_id/:startAt/:endAt', token_controller.verifyToken, eventController.getAllByMonth);
router.post("/invite", token_controller.verifyToken, eventController.addUserToEventsByEmail);
router.post('/accept-invitation/:token', eventController.getAcceptionEvent);
router.patch('/edit', eventController.editEvents);
router.delete('/:id/delete', eventController.deleteEvents);

module.exports = router