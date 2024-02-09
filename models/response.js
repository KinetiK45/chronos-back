class Response {
    constructor(state= true, message, data = undefined) {
        this.state = state;
        this.message = state ? message : check_error(message);
        this.data = data;
    }
}

function check_error(message) {
    if (message.match('Duplicate entry')){
        if (message.match('users.email')){
            return 'Аккаунт с такой почтой уже зарегистрирован!';
        }
        if (message.match('users.login')){
            return 'Аккаунт с таким логином уже зарегистрирован!';
        }
    }
    return message;
}

module.exports = Response;