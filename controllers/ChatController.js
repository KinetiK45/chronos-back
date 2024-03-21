const Messages = require('../models/messages');
const Response = require("../models/response");

async function AddMessage(req ,res){
    try {
        let message = new Messages();
        const { chat_id, content, reply_to} = req.body;
        message.create(chat_id, content, req.senderData.id, reply_to).then((result) => {
            message.find({id: result}).then(() => {
                res.json(new Response(true, 'Message successfully add'));
            }).catch((error) => {
                console.log(error);
                res.json(new Response(false, error.toString()));
            });
        });
    } catch (error) {
        console.error(error);
        res.json(new Response(false, error.toString()));
    }
}

async function EditMessage (req,res) {
    try {
        let message = new Messages();
        const {id, content} = req.body;
        const result  = await message.find({id: id});
        if (result[0].sender_id !== req.senderData.id) {
            res.json(new Response(false, "You cannot change message other user"));
        }else {
            await message.updateById({
               id: result[0].id,
               content: content
            });
            res.json(new Response(true, 'Message successfully edit'));

        }
    }catch (error) {
        console.error(error);
        res.json(new Response(false, error.toString()));
    }
}

async function DeleteMessage(req,res) {
    try {
        let message = new Messages();
        const {id} = req.body;
        const result  = await message.find({id: id});
        if (result[0].sender_id !== req.senderData.id) {
            res.json(new Response(false, "You cannot change message other user"));
        }else {
            await message.delete({id: id });
            res.json(new Response(true, 'Message successfully delete'));
        }
    } catch (error) {
        console.log(error);
        res.json(new Response(false, error.toString()));
    }
}

async function GetChatWithMessage(req,res) {
    try {
        const chat_id = req.params.id;
        let message = new Messages();
        const chat = await message.find({chat_id: chat_id});
        console.log(chat)
        res.json(new Response(true, `All messages by chat_id ${chat_id}` , chat));
    }catch (error) {
        console.log(error);
        res.json(new Response(false, error.toString()));
    }
}

module.exports = {
    AddMessage,
    EditMessage,
    DeleteMessage,
    GetChatWithMessage,
}
    