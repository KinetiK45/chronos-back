const Router = require('express');

const authentication = require('./authentication');
const events = require('./events');
const calendar = require('./calendar');

const router = new Router();

router.use('/api/auth', authentication);
router.use('/api/events' , events);
router.use('/api/calendar', calendar);


module.exports = router;