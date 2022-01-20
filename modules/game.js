const crypto = require('crypto');

var games = [];

module.exports.validate_join = function(join_input) {
    if (typeof join_input['size'] == 'number' && typeof join_input['initial'] == 'number' && join_input['password'] !== null) {
        return true;
    } 
    return false;
}

module.exports.validate_leave = function(leave_input) {
    return leave_input['game'] !== null;
}

module.exports.get_game = function(join_input) {
    for (let game of games) {
        if (game.group == join_input['group'] && game.start == false) {
            if (game.players[0] != join_input['nick']) {
                game.players.push(join_input['nick']);
                game.setStart(true);
            }
            return game.hash;
        }
    }
    let new_game = new Game(join_input);
    games.push(new_game);
    return new_game.hash;
}

module.exports.leave_game = function(leave_input) {
    for (let index in games) {
        if (games[index].hash === leave_input['game']) {
            games.splice(index);
            return true;
        }
    }
    return false;
}

class Game {

    constructor(join_input) {
      this.players = [join_input['nick']];
      this.hash = crypto.randomBytes(20).toString('hex');
      this.size = join_input['size'];
      this.initial = join_input['initial'];
      this.group = join_input['group'];
      this.start = false;
    }

    setStart(start) { this.start = start; };

}