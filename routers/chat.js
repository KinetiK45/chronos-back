const Router = require('express')
const router = new Router;
const chat = require("../controllers/ChatController")
const token_controller = require('../controllers/TokenController');

router.post('/send', token_controller.verifyToken, chat.AddMessage);
router.patch('/edit', token_controller.verifyToken, chat.EditMessage);
router.delete('/delete',token_controller.verifyToken, chat.DeleteMessage);
router.get('/:id',chat.GetChatWithMessage);
module.exports = router;