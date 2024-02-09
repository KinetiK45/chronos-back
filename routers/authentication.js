const Router = require('express')
const router = new Router;
const authentication_controller = require('../controllers/AuthenticationController');
const token_controller = require('../controllers/TokenController');

router.post('/register', authentication_controller.register);
router.post('/login', authentication_controller.login);
router.post('/logout', token_controller.deactivateToken);
router.post('/password-reset', authentication_controller.password_reset);
router.post('/password-reset/:confirm_token', token_controller.verifyLogin, authentication_controller.password_reset_confirmation);

module.exports = router