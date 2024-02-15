const Router = require('express');

const authentication = require('./authentication');
const events = require('./events');
const calendar = require('./calendar');
const chat = require('./chat');

const router = new Router();

router.use('/api/auth', authentication);
router.use('/api/events' , events);
router.use('/api/calendar', calendar);
router.use('/api/chat', chat);

module.exports = router;