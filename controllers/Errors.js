const Response = require("../models/response");
const NOT_FOUND_ERROR = (res, target) => {
    res.json(new Response(false, `Этот ${target} был удален либо его не существовало`));
}

const ACCESS_DENIED = (res) => {
    res.json(new Response(false, `Вы идете нахуй у вас не хватает прав`));
}

const SELF_LIKE = (res) => {
    res.json(new Response(false, 'Мы не ебам что вам нужно. Напиши, или у тебя клавиатура платная'));
}

const DATE_TYPE_ERROR = (res, bad_date) => {
    res.json(new Response(false, `Хуйло без рукое введи нормально дату  ${bad_date}`));
}

module.exports = {
    NOT_FOUND_ERROR,
    ACCESS_DENIED,
    SELF_LIKE,
    DATE_TYPE_ERROR
}