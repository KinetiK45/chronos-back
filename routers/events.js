const Router = require('express')
const router = new Router;
const eventController = require("../controllers/EventsController")
const {setNotification} = require("../controllers/EventsController");

router.post('/new_events',eventController.createEvents);
router.post('/add_user',eventController.addUserToEvents);
router.post('/set_notification',setNotification);
module.exports = router