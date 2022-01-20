const crypto = require('crypto');
const rank = require('./ranking.js');

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

module.exports.validate_notify = function(notify_input) {
    let game;
    for (let index in games) {
        if (games[index].hash === notify_input['game']) {
            game = games[index];
        }
    }
    if (game.turn != notify_input['nick']) {
        return 'turn';
    }
    if (game.isEmpty(notify_input['move'])) {
        return 'empty';
    }
    return 'valid';
}

module.exports.get_game = function(join_input) {
    for (let game of games) {
        if (game.group == join_input['group'] && game.size == join_input['size'] && game.initial == join_input['initial'] && game.start == false && game.active == true) {
            if (game.players[0] != join_input['nick']) {
                game.players.push(join_input['nick']);
                game.setStart(true);
                game.turn = game.players[0];
                game.createBoard();
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
            games[index].active = false;
            setImmediate(() => games[index].winner(null),[games[index]]);
            return true;
        }
    }
    return false;
}

module.exports.forget = function(query) {
    for (let index in games) {
        if (games[index].hash === query['game']) {
            games.splice(index);
        }
    }
}

module.exports.add_response = function(query, response) {
    let game;
    for (let index in games) {
        if (games[index].hash === query['game']) {
            game = games[index];
        }
    }
    if (game.players[0] == query['nick']) {
        game.responses[0] = response;
    } else {
        game.responses[1] = response;
    }
}

module.exports.update = function(query) {
    let game;
    for (let index in games) {
        if (games[index].hash === query['game']) {
            game = games[index];
            break;
        }
    }
    if (game.responses[0] != null && game.responses[1] != null)
        game.update();
}

module.exports.move = function(move, hash) {
    let game;
    for (let index in games) {
        if (games[index].hash === hash) {
            game = games[index];
            break;
        }
    }
    game.move(move);
}

class Game {
    constructor(join_input) {
      this.players = [join_input['nick']];
      this.hash = crypto.randomBytes(20).toString('hex');
      this.size = join_input['size'];
      this.initial = join_input['initial'];
      this.group = join_input['group'];
      this.start = false;
      this.active = true;
      this.turn = '';
      this.board = {};
      this.responses = [null,null];
    }

    setStart(start) { this.start = start; };

    changeTurn() {
        if (this.turn == this.players[0]) {
            this.turn = this.players[1];
        } else {
            this.turn = this.players[0];
        }
    }

    createBoard() {
        let array = [];
        let sides = {};

        for (let i = 0; i < this.size; i++) {
            array.push(this.initial);
        }
        
        for (let player of this.players) {
            Object.defineProperty(sides,player,{
                value: {'store': 0,'pits': array.slice()},
                writable: true,
                enumerable: true,
                configurable: true
              });
        }

        Object.defineProperty(this.board,'sides',{
            value: sides,
            writable: true,
            enumerable: true,
            configurable: true
          });
    }

    check_possibilities(player_holes) {
        for (let hole of player_holes) {
            if (hole !== 0) {
                return true;
            }
        }
        return false;
    }

    isEmpty(move) {
        return this.board['sides'][this.turn]['pits'][move] == 0;
    }

    move(move) {
        let player_holes = this.board['sides'][this.turn]['pits'];
        
        let opponent_holes;
        if (this.players[0] == this.turn) {
            opponent_holes = this.board['sides'][this.players[1]]['pits'];
        } else {
            opponent_holes = this.board['sides'][this.players[0]]['pits'];
        }

        let seeds = player_holes[move];

        player_holes[move] = 0;
        move++;

        while (seeds > 0) {
            if (move < this.size) {
                player_holes[move]++;
            } else if (move === this.size) {
                this.board['sides'][this.turn]['store']++;
            } else if (move < this.size * 2 + 1) {
                opponent_holes[move - this.size - 1]++;
            } else if (move === this.size * 2 + 1) {
                move = -1;
            }
            seeds--;
            if (seeds > 0) { move++; }
        }

        if (move < this.size && player_holes[move] === 1) {
            player_holes[move] = 0;
            this.board['sides'][this.turn]['store'] += 1;
            this.board['sides'][this.turn]['store'] += opponent_holes[this.size - move - 1];
            opponent_holes[this.size - move - 1] = 0;
        }

        if (move !== this.size) {
            if (!this.check_possibilities(opponent_holes)) {
                this.end();
            } else {
                setImmediate(() => this.update());
            }
            this.changeTurn();
        } else {
            if (!this.check_possibilities(player_holes)) {
                this.end();
            } else {
                setImmediate(() => this.update());
            }
        }
    }

    end() {
        let player_holes = this.board['sides'][this.turn]['pits'];
        
        let opponent_holes, opponent;
        if (this.players[0] == this.turn) {
            opponent = this.players[1];
            opponent_holes = this.board['sides'][this.players[1]]['pits'];
        } else {
            opponent = this.players[0];
            opponent_holes = this.board['sides'][this.players[0]]['pits'];
        }

        for (let index in player_holes) {
            this.board['sides'][this.turn]['store'] += player_holes[index];
            player_holes[index] = 0;
        }

        for (let index in opponent_holes) {
            this.board['sides'][opponent]['store'] += opponent_holes[index];
            opponent_holes[index] = 0;
        }

        let winner;
        
        if (this.board['sides'][opponent]['store'] > this.board['sides'][this.turn]['store']) {
            winner = opponent;
        } else {
            winner = this.turn;
        }

        setImmediate(() => this.winner(winner),[winner]);
    }

    update() {
        this.responses[0].write('data: ' + JSON.stringify({'turn': this.turn, 'board': this.board}) + '\n\n');
        this.responses[1].write('data: ' + JSON.stringify({'turn': this.turn, 'board': this.board}) + '\n\n');
    }

    winner(winner) {
        if (this.responses[0] != null) {
            this.responses[0].write('data: ' + JSON.stringify({'winner': winner, 'board': this.board}) + '\n\n');
        }
        if (this.responses[1] != null) {
            this.responses[1].write('data: ' + JSON.stringify({'winner': winner, 'board': this.board}) + '\n\n');
        }
        if (winner != null) {
            rank.add_victory(winner);
        }
    }
}