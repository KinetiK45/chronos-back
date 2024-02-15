const Router = require('express')
const router = new Router;
const eventController = require("../controllers/EventsController")
const token_controller = require("../controllers/TokenController");

router.post('/new_events',eventController.createEvents);
router.post('/set_notification',eventController.setNotification);
router.get('/all/:period', token_controller.verifyToken, eventController.getAllByMonth);
router.post("/invite", eventController.addUserToEventsByEmail);
router.post('/accept-invitation/:token',eventController.getAcception);

module.exports = router