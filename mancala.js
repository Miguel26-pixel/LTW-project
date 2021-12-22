var board;
var pop_ups = ['configuration','rules','classifications','message'];
var server = 'http://twserver.alunos.dcc.fc.up.pt:8008';

window.onload = function() { 
    createBoard(false);
    checkLogin();
}

function getConfigurations() {
    let options1 = document.getElementsByName('radio1');
    let opponent = options1[0];
    for (let i = 0; i < options1.length; i++) {
        if (options1[i].checked)
            opponent = options1[i];
    }

    let options2 = document.getElementsByName('radio2');
    let first = options2[0];
    for (let i = 0; i < options2.length; i++) {
        if (options2[i].checked)
            first = options2[i];
    }

    let options3 = document.getElementsByName('radio3');
    let difficulty = options3[0];
    for (let i = 0; i < options3.length; i++) {
        if (options3[i].checked)
            difficulty = options3[i];
    }
    let c = {   
        hole_number: parseInt(document.getElementById("hole_number").value),
        seed_number: parseInt(document.getElementById("seed_number").value),
        first: first.id,
        difficulty: difficulty.id,
        opponent: opponent.id
    };
    return c;
}

function closePopUps() {
    for (let i = 0; i < pop_ups.length; i++) {
        document.getElementById(pop_ups[i]).style.display = 'none';
    }
}

function displayFlex(s) {
    if (s === "configuration" && board.game) { return; }
    if (document.getElementById(s).style.display == 'flex') {
        document.getElementById(s).style.display = 'none';
    } else {
        closePopUps();
        document.getElementById(s).style.display = 'flex'
    }
}

function start_game() {
    let configurations = getConfigurations();
    if (configurations.opponent == 'computer') {
        closePopUps();
        board.element.remove();
        createBoard(true);
        document.getElementById("quit").style.display="flex";
        document.getElementById("play").style.display="none";

        if (board.getConfigurations().first == "computer" && board.game){
            board.disable_events();
            setTimeout(() => {
                if (board.getConfigurations().difficulty == "hard") {
                    let board_array = board.getBoardArray();
                    board.opponentMove(board.getOpponentBestMove(board_array,board_array[(board.configurations.hole_number * 2 + 1)])[1]);
                } else {
                    board.moveRamdom();
                }
            }, 1000);
        }
    } else {
        join(configurations);
    }
}

function createBoard(game) {
    board = new Board(game);
    board.addToContainer();
}

function move(id) {
    board.myMove(id)
}

function quitGame() {
    let configurations = getConfigurations(); 
    if (configurations.opponent == 'computer') {
        if (board.game == false) {
            let winner = board.getWinner();
            showMessage("PLAYER" + winner + "WON!");
        } else {
            board.disable_events();
            board.setGame(false);
            showMessage("PLAYER QUIT");
        }
        document.getElementById("play").style.display="flex";
        document.getElementById("quit").style.display="none";
    } else {
        leave(); 
    }

}

function showMessage(s) {
    let message = document.getElementById('message-text');
    message.innerHTML = s;
    displayFlex('message');
}

class Board {
    constructor(game) {
        this.element = document.createElement("div");
        this.element.classList.add("board");
        this.element.setAttribute("id","board");

        this.game = game;

        this.configurations = getConfigurations();

        this.grid = new Grid(this.configurations);

        this.element.appendChild(this.grid.element);

        this.updateHTML();
    }

    endGame() {
        this.game = false;
        quitGame();
    }

    getConfigurations() { return this.configurations; }

    updateHTML() { this.grid.updateHTML(); }

    addToContainer() {
        let container = document.getElementById("board-container");
        container.appendChild(this.element);
    }

    disable_events() {
        for (let i = 0; i < this.configurations.hole_number; i++) {
            document.getElementById(i).onclick = null;
        }
    }

    enable_events() {
        for (let i = 0; i < getConfigurations().hole_number; i++) {
            document.getElementById(i).onclick = function() { move(i); }
        }
    }

    setGame(game) {
        this.game = game;
        if (!this.game) { this.finishGame(); }
    }

    finishGame() {
        let holes = this.getHoles();
        for (let i = 0; i < holes.length; i++) {
            if (!(holes[i].getID() == this.configurations.hole_number || holes[i].getID() == this.configurations.hole_number * 2 + 1) && holes[i].getPoints() > 0) {
                if (i < this.configurations.hole_number) {
                    this.grid.addAllSeedsToPoints(1,holes[i].getID());
                } else {
                    this.grid.addAllSeedsToPoints(2,holes[i].getID());
                }
            }
        }
        this.updateHTML();
    }

    getWinner() {
        let holes = this.getHolesPoints();
        
        if (holes[0].getID() == this.configurations.hole_number) {
            if (holes[0].getPoints() > holes[1].getPoints()) { 
                return 1;
            } else if (holes[0].getPoints() < holes[1].getPoints()) {
                return 2;
            }
        } else {
            if (holes[0].getPoints() > holes[1].getPoints()) { 
                return 2;
            } else if (holes[0].getPoints() < holes[1].getPoints()) {
                return 1;
            }
        }
        return -1; //draw
    }

    checkPossibilities(player) {
        let holes = this.getHoles();
        for (let i = 0; i < holes.length; i++) {
            if (!(holes[i].getID() == this.configurations.hole_number || holes[i].getID() == this.configurations.hole_number * 2 + 1)) {
                if (((player === 1) ? !holes[i].opponent : holes[i].opponent) && holes[i].getPoints() > 0) { return true; }
            }
        }
        return false;
    }

    getPossibilities(player,board) {
        let holes = [];
        for (let i = 0; i < board.length; i++) {
            if (player === 1) {
                if (i < this.configurations.hole_number && board[i] > 0) {
                    holes.push(i);
                }
            } else {
                if (i != (this.configurations.hole_number * 2 + 1) && i > this.configurations.hole_number && board[i] > 0) {
                    holes.push(i);
                }
            }
        }
        return holes;
    }

    getHole(id) {
        return this.grid.getHole(id);
    }

    getHoles() {
        return this.grid.getHoles();
    }

    getHolesPoints() {
        return this.grid.getHolesPoints();
    }

    getOppositeID(i) {
        return parseInt(getConfigurations().hole_number) * 2 - i;
    }

    getOpponentPoints() {
        return this.grid.getOpponentPoints();
    }

    myMove(id) {
        if (!this.game) return;

        let hole = this.getHole(id);
        let nexthole;
        
        if (hole.getPoints() == 0) return;
        
        while (hole.getSeeds().length > 0) {
            if (id >= this.configurations.hole_number * 2) {
                id = 0;
            } else { id++; }

            nexthole = this.getHole(id);
            nexthole.addSeed( hole.getSeeds()[0] );
            hole.removeFirstSeed();
        }
        
        if (id < this.configurations.hole_number && nexthole.getPoints() === 1) { 
            this.grid.addAllSeedsToPoints(1,id);
            this.grid.addAllSeedsToPoints(1, this.getOppositeID(id)); 
        } 

        this.updateHTML();
        if (id === this.configurations.hole_number) {
            if (!this.checkPossibilities(1)) { this.endGame(); }
            return;
        }

        this.disable_events();

        if (this.checkPossibilities(2)) {
            setTimeout(() => { 
                if (this.configurations.difficulty == "hard") {
                    let board_array = this.getBoardArray();
                    this.opponentMove(this.getOpponentBestMove(board_array,board_array[(this.configurations.hole_number * 2 + 1)])[1]);
                } else {
                    this.moveRamdom();
                }
            }, 1000);
        } else { this.endGame(); }
    }

    opponentMove(id) {
        if (!this.game) return;
        let hole = this.getHole(id);
        let nexthole;
        
        if (hole.getPoints() == 0) return;
        
        while (hole.getSeeds().length > 0) {
            if (id >= getConfigurations().hole_number * 2 + 1) {
                id = 0;
            } else if (id == getConfigurations().hole_number - 1) {
                id += 2;
            } else { id++; }

            nexthole = this.getHole(id);
            nexthole.addSeed( hole.getSeeds()[0] );
            hole.removeFirstSeed();
        }
        
        if (id > this.configurations.hole_number && id < (this.configurations.hole_number * 2 + 1) && nexthole.getPoints() === 1) { 
            this.grid.addAllSeedsToPoints(2,id);
            this.grid.addAllSeedsToPoints(2, this.getOppositeID(id)); 
        } 

        this.updateHTML();
        
        if (id !== (parseInt(this.configurations.hole_number) * 2 + 1)) {
            if (!this.checkPossibilities(1)) { 
                this.endGame(); 
            } else { this.enable_events(); }
            return;
        }
        if (this.checkPossibilities(2)) {
            setTimeout(() => { 
                if (this.configurations.difficulty == "hard") {
                    let board_array = this.getBoardArray();
                    this.opponentMove(this.getOpponentBestMove(board_array,board_array[(this.configurations.hole_number * 2 + 1)])[1]);
                } else {
                    this.moveRamdom();
                }
            }, 1000);
        } else { this.endGame(); }
    }

    opponentMoveArray(id,board_array,init_points) {
        let hole = id;
        
        while (board_array[hole] > 0) {
            if (id >= this.configurations.hole_number * 2 + 1) {
                id = 0;
            } else if (id == this.configurations.hole_number - 1) {
                id += 2;
            } else { id++; }

            board_array[id]++;
            board_array[hole]--;
        }
        
        if (id > this.configurations.hole_number && id < (this.configurations.hole_number * 2 + 1) && board_array[id] === 1) { 
            board_array[this.configurations.hole_number * 2 + 1] += board_array[id] + board_array[this.getOppositeID(id)]
            board_array[id] = 0;
            board_array[this.getOppositeID(id)] = 0;
        } 
        if (id !== (this.configurations.hole_number * 2 + 1)) {
            return board_array;
        }

        return this.getOpponentBestMove(board_array,init_points)[0];
    }

    moveRamdom() {
        if (!this.checkPossibilities(2)) { this.endGame(); return; }
        let i = Math.floor(Math.random() * parseInt(this.configurations.hole_number)) + parseInt(this.configurations.hole_number) + 1;
        let hole = this.getHole(i);
        while (hole.getPoints() == 0) {
            i = Math.floor(Math.random() * this.configurations.hole_number) + parseInt(this.configurations.hole_number) + 1;
            hole = this.getHole(i);
        }
        this.opponentMove(i);
    }

    getOpponentBestMove(board_array,init_points) {
        let holes = this.getPossibilities(2,board_array);
        if (holes.length === 0) { return [board_array,0]; }
        if (holes.length === 1) { return [board_array,holes[0]]; }

        let holeID = 0;
        let bestPoints = 0;
        let newBoard = board_array;

        for (let i = 0; i < holes.length; i++) {
            let clone = [].concat(board_array);
            clone = this.opponentMoveArray(holes[i], clone,init_points);
            if (clone[this.configurations.hole_number * 2 + 1] - init_points > bestPoints) {
                bestPoints = clone[this.configurations.hole_number * 2 + 1];
                newBoard = clone;
                holeID = holes[i];
            }
        }
        return [newBoard,holeID];
    }

    getMovePoints(id, board_array,init_points) {
        board_array = this.opponentMoveArray(id, board_array,init_points);

        let final_points = board_array[this.configurations.hole_number * 2 + 1];

        return final_points - init_points;
    }

    getBoardArray() {
        let res = [];
        let holes = this.getHoles();
        holes.sort(function (a,b) {
            return a.getID() - b.getID();
        });

        for (let i = 0; i < holes.length; i++) {
            res.push(holes[i].getPoints());
        }
        return res;
    }
}

class Grid {
    constructor(configurations) {
        this.element = document.createElement("div");
        this.element.classList.add("grid-container");

        this.configurations = configurations;

        this.element.style.gridTemplateColumns = "repeat("+(parseInt(configurations.hole_number) + 2)+", 1fr)";

        this.myContainerPoints = new HolePointsContainer((configurations.hole_number * 2 + 1),1);
        this.opponentContainerPoints = new HolePointsContainer((parseInt(configurations.hole_number)),(parseInt(configurations.hole_number) + 2));

        this.element.appendChild(this.myContainerPoints.element);
        this.element.appendChild(this.opponentContainerPoints.element);
        
        this.holePointsContainer = [this.myContainerPoints, this.opponentContainerPoints];
        this.holeContainers = [this.myContainerPoints, this.opponentContainerPoints];

        for (let i = this.configurations.hole_number * 2; i > this.configurations.hole_number; i--) {
            let holeContainer = new HoleContainer(i,false,this.configurations)
            this.element.appendChild(holeContainer.element);
            this.holeContainers.push(holeContainer);
        }

        for (let i = 0; i < configurations.hole_number; i++) {
            let holeContainer = new HoleContainer(i,true,this.configurations)
            this.element.appendChild(holeContainer.element);
            this.holeContainers.push(holeContainer);
        }
    }

    getHoles() {
        return this.holeContainers;
    }

    getHolesPoints() {
        return this.holePointsContainer;
    }

    getHole(id) {
        for (let i = 0; i < this.holeContainers.length; i++) {
            if (this.holeContainers[i].getID() == id) return this.holeContainers[i];
        }
    }

    updateHTML() {
        for (let i = 0; i < this.holeContainers.length; i++) {
            this.holeContainers[i].updateHTML();
        }
    }

    addAllSeedsToPoints(player, id) {
        let hole = this.getHole(id);
        let holePoints = this.getHole((player == 1) ? this.configurations.hole_number : (this.configurations.hole_number * 2 + 1))
        while (hole.getSeeds().length > 0) {
            holePoints.addSeed( hole.getSeeds()[0] );
            hole.removeFirstSeed();
        }
    }

    getOpponentPoints() {
        return this.opponentContainerPoints.getPoints();
    }
}

class HolePointsContainer {
    constructor(id,box) {
        this.element = document.createElement('div');
        this.element.classList.add("box");
        this.element.classList.add("center");
        this.element.style.setProperty("--hole_number",box);

        this.holePoints = new HolePoints(id);
        this.element.appendChild(this.holePoints.element);

        this.points = new Points();
        this.element.appendChild(this.points.element);
    }
    getID() { return this.holePoints.getID(); }

    getPoints() { return this.points.getPoints(); }

    addSeed(seed) { this.holePoints.addSeed(seed); this.points.addPoint(); }

    getSeeds() { return this.holePoints.getSeeds(); }

    updateHTML() { this.holePoints.updateHTML(); this.points.updateHTML(); }
}

class HolePoints {
    constructor(id) {
        this.element = document.createElement('div');
        this.element.classList.add("hole-points");
        this.element.setAttribute("id",id);

        this.id = id;

        this.seeds = [];
    }

    getSeeds() { return this.seeds; }

    getID() { return this.id; }

    addSeed(seed) { this.seeds.push(seed);  }

    updateHTML() {
        this.element.innerHTML = null;
        for (let i = 0; i < this.seeds.length; i++) {
            this.element.appendChild(this.seeds[i].element);
        }
    }
}

class HoleContainer {
    constructor(id, move, configurations) {
        this.element = document.createElement('div');
        this.element.classList.add("center");

        this.configurations = configurations;

        this.opponent = (id > configurations.hole_number) ? true : false;

        this.hole = new Hole(id, move, configurations);
        this.element.appendChild(this.hole.element);

        this.points = new Points();
        this.element.appendChild(this.points.element);

        this.points.setPoints(parseInt(configurations.seed_number));
    }

    getID() { return this.hole.getID(); }

    getPoints() { return this.points.getPoints(); }

    getSeeds() { return this.hole.getSeeds(); }

    removeFirstSeed() { this.hole.removeFirstSeed(); this.points.removePoint(); }

    addSeed(seed) { this.hole.addSeed(seed); this.points.addPoint(); }

    updateHTML() { this.hole.updateHTML(); this.points.updateHTML(); }
}

class Hole {
    constructor(id, move, configurations) {
        this.element = document.createElement("button");
        this.element.classList.add("hole");
        this.element.setAttribute("id",id);
        if (move) {
            let func = (configurations.opponent == 'computer') ? "move("+id+")" : "notify("+id+")";
            this.element.setAttribute("onclick",func);
        }

        this.id = id;

        this.configurations = configurations;

        this.seeds = [];

        for (let i = 0; i < configurations.seed_number; i++) {
            let seed = new Seed();
            this.seeds.push(seed)
            this.element.appendChild(seed.element);
        }
    }

    getID() { return this.id; }

    getSeeds() { return this.seeds; }

    addSeed(seed) { this.seeds.push(seed); }

    removeFirstSeed() { this.seeds.shift(); }

    updateHTML() {
        this.element.innerHTML = null;
        for (let i = 0; i < this.seeds.length; i++) {
            this.element.appendChild(this.seeds[i].element);
        }
    }
}

class Seed {
    constructor() {
        this.element = document.createElement('div');
        this.element.classList.add("seed");

        this.element.style.top = 20 + Math.floor(Math.random() * 50) + "%";
        this.element.style.left = 20 + Math.floor(Math.random() * 50) +"%";
        this.element.style.transform = 'rotate('+Math.floor(Math.random() * 360)+'deg)';
    }
}

class Points {
    constructor() {
        this.element = document.createElement('div');
        this.element.classList.add("number");
        this.points = 0;
        this.element.innerHTML= this.points;
    }

    getPoints() {
        return this.points;
    }

    setPoints(points) {
        this.points = points
    }

    updateHTML() { this.element.innerHTML= this.points; }

    addPoint() { this.points++; }

    removePoint() { this.points--; }
}

//API

function getClassifications() {
    let options = {
        method: 'POST',
        body: JSON.stringify( {} )
    };

    fetch(server+'/ranking',options)
        .then(response => response.json())
        .then(function(obj) {
            if ('ranking' in obj) {
                let ranking = obj.ranking;
                let table = document.createElement('table');
                table.style.width = '100%';

                let tr = table.insertRow();

                let properties = {0: 'Nickname', 1: "Victories", 2: "Games"};
                for (prop in properties) {
                    let th = document.createElement('th');
                    th.innerHTML = properties[prop];
                    tr.appendChild(th);
                }

                for (let i = 0; i < ranking.length; i++) {
                    let tr = table.insertRow();

                    let td1 = document.createElement('td');
                    td1.innerHTML = ranking[i].nick;
                    tr.appendChild(td1);

                    let td2 = document.createElement('td');
                    td2.innerHTML = ranking[i].victories;
                    tr.appendChild(td2);

                    let td3 = document.createElement('td');
                    td3.innerHTML = ranking[i].games;
                    tr.appendChild(td3);
                }

                let classifications = document.getElementById('classifications');

                if (classifications.children.length > 1) {
                    classifications.removeChild(classifications.lastChild);
                }

                classifications.appendChild(table);

            } else {
                console.log(obj.error);
            }
        })
        .catch(function(error) {
            console.log(error);
        });
}

function register(e) {
    e.preventDefault();
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let options = {
        method: 'POST',
        body: JSON.stringify( { "nick": username,
                                "password": password} )
    };
    
    fetch(server+'/register',options)
        .then(response => response.json())
        .then(function(obj) {
            if ('error' in obj) {
                console.log(obj.error);
            } else if (Object.getOwnPropertyNames(obj).length == 0) {
                document.cookie = "nick="+username;
                document.cookie = "password="+password;
                checkLogin();
            }
        })
        .catch(function(error) {
            console.log(error);
        });
}

function logout() {
    document.cookie = "nick=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "password=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    checkLogin();
}

function getCookies() {
    let cookies = {};

    document.cookie.split(';').forEach(function(el) {
        let [key,value] = el.split('=');
        cookies[key.trim()] = value;
    });

    return cookies;
}

function checkLogin() {
    let cookies = getCookies();

    if ('nick' in cookies) {
        document.getElementById('login').style.display = 'none';
        document.getElementById('login-dropdown').style.display = 'none';
        document.getElementById('logout').style.display = 'flex';
        return true;
    } else {
        document.getElementById('logout').style.display = 'none';
        document.getElementById('login').style.display = 'flex';
        return false;
    }
}

function join(configurations) {
    if (!checkLogin()) {
        alert("You need authentication to play against other person");
        return;
    }

    let cookies = getCookies();

    let options = {
        method: 'POST',
        body: JSON.stringify( { "nick": cookies['nick'],
                                "password": cookies['password'],
                                "group": '7992517bf1692d6b0a1a6140646a0e32bc3dfe20e5c9768448107611bd57c703',
                                "size": configurations.hole_number,
                                "initial": configurations.seed_number
                            } )
    };

    fetch(server+'/join',options)
        .then(response => response.json())
        .then(function(obj) {
            if ('error' in obj) {
                console.log(obj.error);
            } else if ('game' in obj) {
                document.cookie = "game="+obj['game'];
                board.element.remove();
                createBoard(true);
                closePopUps();
                document.getElementById("quit").style.display="flex";
                document.getElementById("play").style.display="none";
            }
        })
        .catch(function(error) {
            console.log(error);
        });
}

function leave() {
    let cookies = getCookies();
    let options = {
        method: 'POST',
        body: JSON.stringify( { "nick": cookies['nick'],
                                "password": cookies['password'],
                                "game": cookies['game']
                            } )
    };

    fetch(server+'/leave',options)
        .then(response => response.json())
        .then(function(obj) {
            if ('error' in obj) { console.log(obj.error); }

            document.cookie = "game=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.getElementById("play").style.display="flex";
            document.getElementById("quit").style.display="none";
        })
        .catch(function(error) {
            console.log(error);
        });
}

function notify(id) {
    let cookies = getCookies();
    let options = {
        method: 'POST',
        body: JSON.stringify( { "nick": cookies['nick'],
                                "password": cookies['password'],
                                "game": cookies['game'],
                                "move": id
                            } )
    };

    fetch(server+'/notify',options)
        .then(response => response.json())
        .then(function(obj) {
            console.log(obj);
            if ('error' in obj) {
                console.log(obj.error);
            } else if (Object.getOwnPropertyNames(obj).length == 0) {
                console.log('PASSOU');
            }
        })
        .catch(function(error) {
            console.log(error);
        });
}