import { getConfigurations } from "./utils.js"



export class Board {
    constructor(game) {
        this.element = document.createElement("div");
        this.element.classList.add("board");
        this.element.setAttribute("id","board");

        this.game = game;

        this.configurations = getConfigurations();

        this.grid = new Grid(this, this.configurations).element;

        this.element.appendChild(this.grid);
    }

    addToContainer() {
        let container = document.getElementById("board-container");
        container.appendChild(this.element);
    }

    disable_events() {
        for (let i = 0; i < this.configurations.hole_number; i++) {
            document.getElementById('hole-'+i).onclick = null;
        }
    }

    enable_events() {
        for (let i = 0; i < getConfigurations().hole_number; i++) {
            document.getElementById('hole-'+i).onclick = function() { move(i); }
        }
    }

    setGame(game) {
        this.game = game;
    }

    checkPossibilities(player) {
        if (player === 1) {
            for (let i = 0; i < getConfigurations().hole_number; i++) {
                if (document.getElementById('hole-'+i).getElementsByClassName('seed').length > 0) return true;
            }
        } else {
            for (let i = parseInt(getConfigurations().hole_number) * 2; i > getConfigurations().hole_number; i -= 1) {
                if (document.getElementById('hole-'+i).getElementsByClassName('seed').length > 0) return true;
            }
        }
        return false;
    }
}

class Grid {
    constructor(board, configurations) {
        this.element = document.createElement("div");
        this.element.classList.add("grid-container");

        this.configurations = configurations;

        this.element.style.gridTemplateColumns = "repeat("+(parseInt(configurations.hole_number) + 2)+", 1fr)";

        this.containerPoints1 = new HolePointsContainer("hole-"+(configurations.hole_number * 2 + 1),1);
        this.containerPoints2 = new HolePointsContainer("hole-"+(parseInt(configurations.hole_number)),(parseInt(configurations.hole_number) + 2));

        this.element.appendChild(this.containerPoints1.element);
        this.element.appendChild(this.containerPoints2.element);

        this.holeContainers = [];

        for (let i = this.configurations.hole_number * 2; i > this.configurations.hole_number; i--) {
            let holeContainer = new HoleContainer("hole-"+i,false,this.configurations)
            this.element.appendChild(holeContainer.element);
        }

        for (let i = 0; i < configurations.hole_number; i++) {
            let holeContainer = new HoleContainer("hole-"+i,true,this.configurations)
            this.element.appendChild(holeContainer.element);
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
}

class HolePoints {
    constructor(id) {
        this.element = document.createElement('div');
        this.element.classList.add("hole-points");
        this.element.setAttribute("id",id);

        this.id = id;
    }
}

class HoleContainer {
    constructor(id, move, configurations) {
        this.element = document.createElement('div');
        this.element.classList.add("center");

        this.configurations = configurations;

        this.hole = new Hole(id, move, configurations);
        this.element.appendChild(this.hole.element);

        this.points = new Points();
        this.element.appendChild(this.points.element);
    }
}

class Hole {
    constructor(id, move, configurations) {
        this.element = document.createElement("button");
        this.element.classList.add("hole");
        this.element.setAttribute("id",id);
        this.element.setAttribute("onclick","move("+id.charAt(id.length-1)+")");

        this.id = id;

        this.configurations = configurations;

        this.seeds = [];

        for (let i = 0; i < configurations.seed_number; i++) {
            let seed = new Seed();
            this.seeds.push(seed)
            this.element.appendChild(seed.element);
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

    addPoints(points) {
        this.points += points
        this.element.innerHTML= this.points;
    }
}