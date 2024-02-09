const Router = require('express');

const authentication = require('./authentication');
const events = require('./events')

const router = new Router();

router.use('/api/auth', authentication);
router.use('/api/events' , events);

// router.use('/api/users', userRoutes);
// router.use('/api/posts', postRoutes);
// router.use('/api/categories', categoryRoutes);
// router.use('/api/comments', commentsRoutes);

module.exports = router;