const fs = require('fs')
const path_ranking = './data/ranking.json';

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


module.exports.add_victory = function(nick) {
    fs.readFile(path_ranking, function(err, data){
        if(! err) {
            let ranking = JSON.parse(data.toString());
            let check = false;
            for (let rank of ranking.ranking) {
                if (rank['nick'] == nick) {
                    rank['victories']++;
                    check = true;
                    break;
                }
            }
            if (!check) {
                ranking.ranking.push({'nick' : nick, 'victories' : 1,'games' : 1});
            }

            fs.writeFile(path_ranking,JSON.stringify(ranking),function(err) {
                if(err) {
                   console.log('error writing ranking'); 
                }
            });
        } else {
            console.log('error reading ranking');
        }
    });
}

function sort_victories(top) {
    return  top.sort(function(a,b) {
                return b.victories - a.victories;
            });
}