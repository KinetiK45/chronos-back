const User = require('../models/user');
const Response = require("../models/response");
const fs = require('fs');
const path = require("path");

async function getAllUser(req, res){
    try {
        let user = new User();
        const {page,limit} = req.query;
        if(page >= 1 ) {
            const allUser = await user.find_with_sort({page: page, size: limit});
            res.json(new Response(true, "All users by page" + page, allUser));
        }else {
            res.json(new Response(false,"incorrect page, page must be more or equals than 1, but your page " + page));
        }
    } catch (error) {
        console.error(error);
        res.status(500).json(new Response(false, "Internal server error"));
    }
}
async function getById(req,res){
    try {
        let user = new User();
        const { id } = req.params;
        const userById = await user.find({ id: id });
        const filteredUser = userById.map(({ id, full_name }) => ({ id, full_name }));
        if (userById.length === 0){
            return res.json(new Response(false, "not found"));
        }
        res.json(new Response(true, "users by id", filteredUser));
    } catch (error) {
        console.error(error);
        res.status(500).json(new Response(false, "Internal server error"));
    }
}

async function userAvatar(req, res) {
    const user_id = req.params.user_id;
    let user = new User();
    user.find({id: user_id})
        .then((users)=>{
            if (users.length === 0){
                res.json(new Response(false, 'Пользователя с таким id не найдено!'))
            }
            else{
                let filename = users[0].photo
                const filePath = path.join(__dirname, '../images', filename);
                res.sendFile(filePath);
            }
        }).catch((error)=>{
        res.json(new Response(false, error.toString()))
    });
}

async function findByFullName(req,res) {
    try {
        let user = new User();
        const { stringValue } = req.params
        const result = await user.findByFullName(req.senderData.id,stringValue);
        if(result !== null) {
            res.json(new Response(true," all user what found by " + stringValue, result));
        } else {
            res.json(new Response(true,"not found any user by stringValue " + stringValue));
        }
    } catch (error) {
        res.json(new Response(false,error.toString()));
    }

}
async function avatarUpload(req, res) {
    if (!req.file) {
        return res.json(new Response(false, 'Ошибка загрузки файла!'));
    }
    const photo = req.file;
    const account_id = Number.parseInt(req.headers.account_id);
    if (!account_id)
        return res.json(new Response(false, 'Не указан id аккаунта!'));
    if (account_id !== req.senderData.id && req.senderData.role !== 'admin')
        return res.json(new Response(false, 'Access denied!'));
    const filename = photo.filename.toString().toLowerCase();
    if (filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg')){
        let user = new User();
        user.find({id: account_id}).then((results) => {
            let userdata = results[0];
            userdata.photo = photo.filename;
            console.log(userdata);
            user.updateById(userdata).then(() => {
                res.json(new Response(true, 'Фото успешно обновлено'));
            })
                .catch((error)=> {
                    res.json(new Response(false, error.toString()))
                })
        }).catch((error) => {
            res.json(new Response(false, `Не найдено аккаунта с id ${account_id}`))
        })
    }
    else {
        res.json(new Response(false, 'Данный тип изображения не поддерживается'));
        fs.unlink(photo.path, (err) => {
            if (err) {
                console.error(`Ошибка при удалении файла: ${err}`);
            }
        });
    }
}

module.exports = {
    getAllUser,
    getById,
    avatarUpload,
    userAvatar,
    findByFullName
}