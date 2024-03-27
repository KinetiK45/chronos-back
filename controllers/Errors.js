const Response = require("../models/response");
const NOT_FOUND_ERROR = (res, target) => {
    res.json(new Response(false, `${target} not found`));
}

const ACCESS_DENIED = (res) => {
    res.json(new Response(false, `ACCESS DENIED`));
}

const DATE_TYPE_ERROR = (res, bad_date) => {
    res.json(new Response(false, `date incorrect ${bad_date}`));
}

module.exports = {
    NOT_FOUND_ERROR,
    ACCESS_DENIED,
    DATE_TYPE_ERROR
}