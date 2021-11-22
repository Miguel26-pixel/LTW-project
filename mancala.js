var is_moving = false;
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

    let grid = document.getElementById("grid");
    grid.style.gridTemplateColumns = "repeat("+(parseInt(configurations.hole_number) + 2)+", 1fr)";

    //style="--radius: var(--rad-50);"
    grid.innerHTML = '<div class="center box1"><div id="hole-'+ (configurations.hole_number * 2 + 1) +'" class="hole-points"></div><div class="number">0</div></div><div class="center box2" style="--hole_number: '+(parseInt(configurations.hole_number) + 2)+'"><div id="hole-'+configurations.hole_number+'" class="hole-points"></div><div class="number">0</div></div>';

    let hole='';
    
    for (let i = 0; i < configurations.seed_number; i++) {
        hole += '<div id="seed" class="seed"></div>';
    }

    hole += '</button><div class="number">'+configurations.seed_number+'</div></div>';

    for (let i = configurations.hole_number * 2; i > configurations.hole_number; i--) {
        grid.innerHTML += '<div class="center"><button id="hole-'+i+'" class="hole"">'+hole;
    }

    for (let i = 0; i < configurations.hole_number; i++) {
        grid.innerHTML += '<div class="center"><button id="hole-'+i+'" class="hole" onclick="move('+i+')">'+hole;
    }
    randomPosition();
}

function start_game() {
    closePopUps();
    createBoard();
    game = true;
    document.getElementById("quit").style.display="flex";
    document.getElementById("play").style.display="none";
    displayFlex("configuration");
}

function quit_game() {
    if (is_moving) return;
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

function move(i) {
    if (is_moving || !game) return;
    console.log("Player-TURN1");
    is_moving = true;
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
    console.log("Player-TURN2");
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
    console.log("Player-TURN3");
    setTimeout(function(){ moveRamdom(); is_moving = false; }, 1000);
}

function moveRamdom() {
    console.log("PC-TURN1");
    if (!checkPossibilities(2)) { is_moving = false; quit_game(); return; }
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
    console.log("PC-TURN1");
    if (nexthole.id === 'hole-'+ (getConfigurations().hole_number * 2 + 1)) { 
        setTimeout(function(){ if (checkPossibilities(2)) moveRamdom(); }, 1000);
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
    }
    console.log("PC-TURN1");
    if (!checkPossibilities(1)) { is_moving = false; quit_game(); return; }
}



function getConfigurations() {
    let c = {   
        hole_number: document.getElementById("hole_number").value,
        seed_number: document.getElementById("seed_number").value
    };
    return c;
}

window.onload = function() { 
    createBoard();
}