const Router = require('express')
const router = new Router;
const eventController = require("../controllers/EventsController")

router.post('/new_events',eventController.createEvents);
router.post('/add_user',eventController.addUserToEvents);
router.post('/set_notification',eventController.setNotification);
router.get('/all',eventController.getAllByMonth);
module.exports = router