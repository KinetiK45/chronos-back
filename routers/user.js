const Router = require('express')
const router = new Router;
const user = require('../controllers/UserController');

router.get('/all',user.getAllUser);

module.exports = router;