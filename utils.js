export function getConfigurations() {
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
