const Model = require("./model");

class User extends Model {
    constructor() {
        super("users");
    }
    registration(username, password, email, full_name, racist = true, race = "istribitel mig-28 v sovershenstve", is_vlaDICK = true, supporting_feminism = false, religion = 'Atheist', role_id = 2){
        this.username = username;
        this.password = password;
        this.email = email;
        this.full_name = full_name;
        this.racist = racist;
        this.race = race;
        this.is_vlaDICK = is_vlaDICK;
        this.supporting_feminism = supporting_feminism;
        this.religion = religion;
        this.role_id = role_id;
        return this.insert();
    }
}
module.exports = User;