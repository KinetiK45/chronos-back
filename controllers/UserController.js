const User = require('../models/user');
const Response = require("../models/response");

async function getAllUser(req, res){
    try {
        let user = new User();
        const {page,limit} = req.query;
        const allUser = user.find_with_sort({page: page, size: limit});
        res.json(new Response(true, "All users by page" + page, allUser));
    } catch (error) {
        console.error(error);
        res.status(500).json(new Response(false, "Internal server error"));
    }
}
async function getById(req,res){
    try {
        let user = new User();
        const {id} = req.query;
        const userById = user.find({id: id});
        res.json(new Response(true, "users by id", userById));
    } catch (error) {
        console.error(error);
        res.status(500).json(new Response(false, "Internal server error"));
    }
}
async function findByFullName(req, res){
    let user = new User();
}

module.exports = {
    getAllUser,
    getById
}