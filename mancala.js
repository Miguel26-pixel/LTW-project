//import { Board } from "./classes.js"

var board;
var pop_ups = ['configuration','rules','classifications'];


function createBoard(game) {
    board = new Board(game);
    board.addToContainer();
}

function start_game() {
    closePopUps();
    game = true;
    board.element.remove();
    createBoard(true);
    document.getElementById("quit").style.display="flex";
    document.getElementById("play").style.display="none";

    if (board.configurations.first == "computer" && board.game){
        board.disable_events();
        setTimeout(function(){ moveRamdom();}, 1000);
    }
}

function quit_game() {
    board.setGame(false);
    document.getElementById("play").style.display="flex";
    document.getElementById("quit").style.display="none";
}

function move(id) {
    board.myMove(id)
}

window.onload = function() { 
    createBoard(false);
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
    }

    checkPossibilities(player) {
        let holes = this.getHoles();
        for (let i = 0; i < holes.length; i++) {
            if ((player === 1) ? !holes[i].opponent : holes[i].opponent && holes[i].getPoints() > 0) return true;
        }
        return false;
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
        
        if (id === parseInt(this.configurations.hole_number)) return;

        this.disable_events();
        setTimeout(() => { this.moveRamdom(); }, 1000);
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
        
        if (id > this.configurations.hole_number && nexthole.getPoints() === 1) { 
            this.grid.addAllSeedsToPoints(2,id);
            this.grid.addAllSeedsToPoints(2, this.getOppositeID(id)); 
        } 

        this.updateHTML();
        
        if (id !== (parseInt(this.configurations.hole_number) * 2 + 1)) {
            if (!this.checkPossibilities(1)) { 
                this.quit_game(); 
            } else { this.enable_events(); }
            return;
        }

        setTimeout(function() { this.moveRamdom(); }, 1000);
    }

    moveRamdom() {
        if (!this.checkPossibilities(2)) { this.quit_game(); return; }
        let i = Math.floor(Math.random() * parseInt(this.configurations.hole_number)) + parseInt(this.configurations.hole_number) + 1;
        let hole = this.getHole(i);
        while (hole.getPoints() == 0) {
            i = Math.floor(Math.random() * this.configurations.hole_number) + parseInt(this.configurations.hole_number) + 1;
            hole = this.getHole(i);
        }
        this.opponentMove(i);
    }

}

class Grid {
    constructor(configurations) {
        this.element = document.createElement("div");
        this.element.classList.add("grid-container");

        this.configurations = configurations;

        this.element.style.gridTemplateColumns = "repeat("+(parseInt(configurations.hole_number) + 2)+", 1fr)";

        this.containerPoints1 = new HolePointsContainer((configurations.hole_number * 2 + 1),1);
        this.containerPoints2 = new HolePointsContainer((parseInt(configurations.hole_number)),(parseInt(configurations.hole_number) + 2));

        this.element.appendChild(this.containerPoints1.element);
        this.element.appendChild(this.containerPoints2.element);
        
        this.holePointsContainer = [this.containerPoints1, this.containerPoints2];
        this.holeContainers = [this.containerPoints1, this.containerPoints2];

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

        this.opponent = (id < configurations.hole_number) ? true : false;

        this.hole = new Hole(id, move, configurations);
        this.element.appendChild(this.hole.element);

        this.points = new Points();
        this.element.appendChild(this.points.element);

        this.points.setPoints(configurations.seed_number);
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
        this.element.setAttribute("onclick","move("+id+")");

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

function getConfigurations() {
    let options = document.getElementsByName('radio2');
    let first = options[0];
    for (let i = 0; i < options.length; i++) {
        if (options[i].checked)
            first = options[i];
    }
    let c = {   
        hole_number: document.getElementById("hole_number").value,
        seed_number: document.getElementById("seed_number").value,
        first: first.id
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


