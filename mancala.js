function myFunction() {
    var seeds = document.getElementsByClassName("seed");
    for ( var i=0; i < seeds.length; i++ ) {
        var seed = seeds[i];
        seed.style.top = 20 + Math.floor(Math.random() * 50) + "%";
        seed.style.left = 20 + Math.floor(Math.random() * 50) +"%";
        seed.style.transform = 'rotate('+Math.floor(Math.random() * 360)+'deg)';
    }
}

function displayFlex(s) {
    if (document.getElementById(s).style.display == 'flex') {
        document.getElementById(s).style.display = 'none';
    } else {
        document.getElementById(s).style.display = 'flex'
    }
}

function createBoard() {
    let configurations = getConfigurations();

    let grid = document.getElementById("grid");
    grid.style.gridTemplateColumns = "("+configurations.hole_number + 2+", 1fr)";

    grid.innerHTML = '<div class="center box1"><div class="hole-points"></div><div class="number">0</div></div><div class="center box2"><div class="hole-points"></div><div class="number">0</div></div>';

    let hole='<div class="center"><div class="hole">';
    
    for (let i = 0; i < configurations.seed_number; i++) {
        hole += '<div id="seed" class="seed"></div>';
    }

    hole += '</div><div class="number">'+configurations.seed_number+'</div></div>';

    for (let i = 0; i < configurations.hole_number * 2; i++) {
        grid.innerHTML += hole;
    }
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
    myFunction();
}