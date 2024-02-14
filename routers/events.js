const Router = require('express')
const router = new Router;
const eventController = require("../controllers/EventsController")

router.post('/new_events',eventController.createEvents);
router.post('/set_notification',eventController.setNotification);
router.get('/all/:period',eventController.getAllByMonth);
router.post("/invite",eventController.addUserToEventsByEmail);
router.post('/accept-invitation/:token',eventController.getAcception);
module.exports = router