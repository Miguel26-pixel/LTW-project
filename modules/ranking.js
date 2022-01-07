module.exports.choose_top_10 = function(ranking) {
    let top = [];
    for (let user of ranking.ranking) {
        if (top.length < 10) {
            top.push(user);
        } else {
            top = sort_victories(top);
            if (top[top.length - 1].victories < user.victories) {
                top.pop();
                top.push(user);
            }
        }
    }
    ranking.ranking = sort_victories(top);
    return ranking;
}

function sort_victories(top) {
    return  top.sort(function(a,b) {
                return b.victories - a.victories;
            });
}