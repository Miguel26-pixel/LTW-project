var game = false;
var pop_ups = ['configuration','rules','classifications'];

function randomPosition() {
    var seeds = document.getElementsByClassName("seed");
    for ( var i=0; i < seeds.length; i++ ) {
        var seed = seeds[i];
        seed.style.top = 20 + Math.floor(Math.random() * 50) + "%";
        seed.style.left = 20 + Math.floor(Math.random() * 50) +"%";
        seed.style.transform = 'rotate('+Math.floor(Math.random() * 360)+'deg)';
    }
}

function closePopUps() {
    for (let i = 0; i < pop_ups.length; i++) {
        document.getElementById(pop_ups[i]).style.display = 'none';
    }
}

function displayFlex(s) {
    if (s === "configuration" && game) { return; }
    if (document.getElementById(s).style.display == 'flex') {
        document.getElementById(s).style.display = 'none';
    } else {
        closePopUps();
        document.getElementById(s).style.display = 'flex'
    }
}

function createBoard() {
    let configurations = getConfigurations();

    let board = document.getElementById("board");
    board.innerHTML=""

    let grid = document.createElement("div");
    grid.classList.add("grid-container");
    grid.style.gridTemplateColumns = "repeat("+(parseInt(configurations.hole_number) + 2)+", 1fr)";

    let hole_points = document.createElement('div');
    hole_points.classList.add("hole-points");

    let number = document.createElement('div');
    number.classList.add("number");
    number.innerHTML='0';

    let container_points1 = document.createElement('div'); let container_points2 = document.createElement('div');
    container_points1.classList.add("center"); container_points2.classList.add("center");
    container_points1.classList.add("box1"); container_points2.classList.add("box2");
    container_points2.style.setProperty("--hole_number",(parseInt(configurations.hole_number) + 2));
    container_points1.appendChild(hole_points.cloneNode(true)); container_points2.appendChild(hole_points.cloneNode(true));
    container_points1.appendChild(number.cloneNode(true)); container_points2.appendChild(number.cloneNode(true));
    container_points1.firstChild.setAttribute("id","hole-"+(configurations.hole_number * 2 + 1));
    container_points2.firstChild.setAttribute("id","hole-"+configurations.hole_number);

    grid.appendChild(container_points1);
    grid.appendChild(container_points2);

    let hole_container = document.createElement('div');
    hole_container.classList.add("center");

    let hole = document.createElement("button");
    hole.classList.add("hole");

    let seed = document.createElement('div');
    seed.classList.add("seed");
    
    for (let i = 0; i < configurations.seed_number; i++) {
        hole.appendChild(seed.cloneNode(true))
    }

    number.innerHTML = configurations.seed_number;

    hole_container.appendChild(hole);
    hole_container.appendChild(number.cloneNode(true));
    

    for (let i = configurations.hole_number * 2; i > configurations.hole_number; i--) {
        let clone = hole_container.cloneNode(true);
        clone.firstChild.setAttribute("id","hole-"+i);
        grid.appendChild(clone);
    }

    for (let i = 0; i < configurations.hole_number; i++) {
        let clone = hole_container.cloneNode(true); 
        clone.firstChild.setAttribute("id","hole-"+i);
        clone.firstChild.setAttribute("onclick","move("+i+")");
        grid.appendChild(clone);
    }
    
    board.appendChild(grid);
    randomPosition();

    if (configurations.first == "computer" && game){
        disable_events();
        setTimeout(function(){ moveRamdom();}, 1000);
    }
}

function start_game() {
    closePopUps();
    game = true;
    createBoard();
    document.getElementById("quit").style.display="flex";
    document.getElementById("play").style.display="none";
    displayFlex("configuration");
}

function quit_game() {
    game = false;
    document.getElementById("play").style.display="flex";
    document.getElementById("quit").style.display="none";
}

function checkPossibilities(player) {
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

function getOppositeHole(i) {
    return document.getElementById('hole-'+(parseInt(getConfigurations().hole_number) * 2 - i))
}

function disable_events() {
    for (let i = 0; i < getConfigurations().hole_number; i++) {
        document.getElementById('hole-'+i).onclick=null;
    }
}

function enable_events() {
    for (let i = 0; i < getConfigurations().hole_number; i++) {
        document.getElementById('hole-'+i).onclick= function() { move(i); }
    }
}

function move(i) {
    if (!game) return;
    let hole = document.getElementById('hole-'+i);
    let seeds = hole.getElementsByClassName('seed');
    if (seeds.length == 0) return;
    while (seeds.length > 0) {
        if (i >= getConfigurations().hole_number * 2) {
            i = 0;
        } else { i++; }
        nexthole = document.getElementById('hole-'+ i);
        nexthole.appendChild(seeds[0]);
        nexthole.parentElement.getElementsByClassName('number')[0].innerHTML = nexthole.getElementsByClassName('seed').length;
    }
    
    hole.parentElement.getElementsByClassName('number')[0].innerHTML = '0';
    if (nexthole.id === 'hole-'+getConfigurations().hole_number) { 
        is_moving = false; 
        return; 
    } else if (i < getConfigurations().hole_number && nexthole.getElementsByClassName('seed').length === 1) {
        let my_points = document.getElementById('hole-'+ getConfigurations().hole_number);
        my_points.appendChild(nexthole.getElementsByClassName('seed')[0]);
        nexthole.parentElement.getElementsByClassName('number')[0].innerHTML = '0';
        let opposite_hole = getOppositeHole(i);
        let opposite_seeds = opposite_hole.getElementsByClassName('seed');
        while (opposite_seeds.length > 0) {
            my_points.appendChild(opposite_seeds[0]);
        }
        opposite_hole.parentElement.getElementsByClassName('number')[0].innerHTML = '0';
        my_points.parentElement.getElementsByClassName('number')[0].innerHTML = my_points.getElementsByClassName('seed').length;
    } 
    disable_events();
    setTimeout(function(){ moveRamdom();}, 1000);
}

function moveRamdom() {
    if (!game) return;
    if (!checkPossibilities(2)) { quit_game(); return; }
    let i = Math.floor(Math.random() * parseInt(getConfigurations().hole_number)) + parseInt(getConfigurations().hole_number) + 1;
    let hole = document.getElementById('hole-'+i);
    let seeds = hole.getElementsByClassName('seed');
    let nexthole = null;
    while (seeds.length == 0) {
        i = Math.floor(Math.random() * getConfigurations().hole_number) + parseInt(getConfigurations().hole_number) + 1;
        hole = document.getElementById('hole-'+i);
        seeds = hole.getElementsByClassName('seed');
    }
    while (seeds.length > 0) {
        if (i >= getConfigurations().hole_number * 2 + 1) {
            i = 0;
        } else if (i == getConfigurations().hole_number) {
            i += 2;
        }
        else { i++; }
        nexthole = document.getElementById('hole-'+ i);
        nexthole.appendChild(seeds[0]);
        nexthole.parentElement.getElementsByClassName('number')[0].innerHTML = nexthole.getElementsByClassName('seed').length;
    }
    hole.parentElement.getElementsByClassName('number')[0].innerHTML = '0';

    if (nexthole.id === 'hole-'+ (getConfigurations().hole_number * 2 + 1)) { 
        setTimeout(function() {
             if (checkPossibilities(2)) { moveRamdom(); }
             else { quit_game(); } 
            }, 1000);
    } else if (i > getConfigurations().hole_number && nexthole.getElementsByClassName('seed').length === 1 ) {
        let my_points = document.getElementById('hole-'+ (parseInt(getConfigurations().hole_number) * 2 + 1));
        my_points.appendChild(nexthole.getElementsByClassName('seed')[0]);
        nexthole.parentElement.getElementsByClassName('number')[0].innerHTML = '0';
        let opposite_hole = getOppositeHole(i);
        let opposite_seeds = opposite_hole.getElementsByClassName('seed');
        while (opposite_seeds.length > 0) {
            my_points.appendChild(opposite_seeds[0]);
        }
        opposite_hole.parentElement.getElementsByClassName('number')[0].innerHTML = '0';
        my_points.parentElement.getElementsByClassName('number')[0].innerHTML = my_points.getElementsByClassName('seed').length;
        enable_events();
    } else {
        enable_events();
    }
    if (!checkPossibilities(1)) {quit_game(); return; }
}

function moveBestPlay() {
    let best_move = 0;
    let best_points = 0;
    for (let i = parseInt(getConfigurations().hole_number) * 2; i > getConfigurations().hole_number; i -= 1) {
        if (document.getElementById('hole-'+i).getElementsByClassName('seed').length > 0) {
            let points = getPoints('hole-'+i);
            if (points > best_points) {
                best_points = points;
                best_move = i;
            }
        }
    }
}

function getPoints(id) {

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

window.onload = function() { 
    createBoard();
}