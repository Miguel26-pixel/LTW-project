module.exports.validate_input = function(user_input) {
    return user_input['password'].length >= 6;
}

module.exports.validate_user = function(user,users) {
    for (u of users.users) {
        if (u['nick'] === user['nick'] && u['password'] !== user['password']) {
            return "error";
        } else if(u['nick'] === user['nick'] && u['password'] === user['password']) {
            return "valid";
        }
    }
    return "new";
}
