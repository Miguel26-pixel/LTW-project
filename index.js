const http = require('http');
const url = require('url');
const fs = require('fs');
const rank = require('./modules/ranking.js');
const register = require('./modules/register.js');
const game = require('./modules/game.js');

const path_ranking = './data/ranking.json';
const path_users = './data/users.json';

const headers = {
    'Content-Type': 'application/javascript',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'        
};

const server = http.createServer(function (request, response) {
    const parsedUrl = url.parse(request.url,true);
    switch(request.method) {
        case 'POST':
            switch(parsedUrl.pathname) {
                case '/ranking':
                    do_ranking(request, response);
                    break;
                case '/register':
                    do_register(request, response);
                    break;
                case '/join':
                    do_join(request, response);
                    break;
                case '/leave':
                    do_leave(request, response);
                    break;
                default:
                    response.writeHead(404, {'Content-Type': 'text/plain'});
                    response.end("404 Not found\n");
                    break;
            }
            break;
        default:
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.end("404 Not found\n");
    }
});

//server.listen(8960);
server.listen(8008);

function do_ranking(request,response) {
    fs.readFile(path_ranking, function(err, data){
        if(! err) {
            let ranking = JSON.parse(data.toString());
            ranking = rank.choose_top_10(ranking);
            
            response.writeHead(200, headers);
            response.end(JSON.stringify(ranking));
        } else {
            response.writeHead(400, headers);
            response.end(JSON.stringify({'error': 'server error on request to'+request.url}));
        }
    });
}

function do_register(request,response) {
    let body = '';
    request.on('data', (chunk) => { body += chunk;  })
        .on('end', () => {
            try { 
                user_input = JSON.parse(body);
                let valid = register.validate_input(user_input);
                if (!valid) {
                    response.writeHead(401, headers);
                    response.end(JSON.stringify({'error': 'password with less than 6 characters'}));
                } else {
                    fs.readFile(path_users, function(err, data){
                        if(! err) {
                            if (data.toString() === "") {
                                fs.writeFile(path_users,JSON.stringify({"users":[user_input]}),function(err) {
                                    if(! err) {
                                        response.writeHead(200, headers);
                                        response.end(JSON.stringify({}));
                                    } else {
                                        response.writeHead(400, headers);
                                        response.end(JSON.stringify({'error': 'server error on request to'+request.url}));
                                    }
                                });
                            } else {
                                let users = JSON.parse(data.toString());
                                let status = register.validate_user(user_input,users);
                                if (status === "error") {
                                    response.writeHead(401, headers);
                                    response.end(JSON.stringify({"error": "User registered with a different password"}));
                                } else if (status === "new") {
                                    users.users.push(user_input);
                                    fs.writeFile(path_users,JSON.stringify(users),function(err) {
                                        if(! err) {
                                            response.writeHead(200, headers);
                                            response.end(JSON.stringify({}));
                                        } else {
                                            response.writeHead(400, headers);
                                            response.end(JSON.stringify({'error': 'server error on request to'+request.url}));
                                        }
                                    });
                                } else {
                                    response.writeHead(200, headers);
                                    response.end(JSON.stringify({}));
                                }
                            }
                        } else {
                            response.writeHead(400, headers);
                            response.end(JSON.stringify({'error': 'server error on request to'+request.url}));
                        }
                    }); 
                }
            }
            catch(err) {  
                response.writeHead(400, headers);
                response.end(JSON.stringify({'error': 'server error on request to '+request.url}));
            }
        })
        .on('error', (err) => { 
            response.writeHead(400, headers);
            response.end(JSON.stringify({'error': 'server error on request to '+request.url}));
        });
}


function do_join(request,response) {
    let body = '';
    request.on('data', (chunk) => { body += chunk;  })
        .on('end', () => {
            join_input = JSON.parse(body);
            fs.readFile(path_users, function(err, users_data){
                if(! err) {
                    let users = JSON.parse(users_data.toString());
                    let status = register.validate_user(join_input,users);
                    if (status === 'valid') {
                        if (game.validate_join(join_input) === true) {
                            let hash = game.get_game(join_input);
                            response.writeHead(200, headers);
                            response.end(JSON.stringify({'game': hash}));
                        }
                    } else {
                        response.writeHead(400, headers);
                        response.end(JSON.stringify({'error': 'server error on request to'+request.url}));
                    }
                } else {
                    response.writeHead(400, headers);
                    response.end(JSON.stringify({'error': 'server error on request to'+request.url}));
                }
            });
        })
        .on('error', (err) => { 
            response.writeHead(400, headers);
            response.end(JSON.stringify({'error': 'server error on request to '+request.url}));
        });
}

function do_leave(request,response) {
    let body = '';
    request.on('data', (chunk) => { body += chunk;  })
        .on('end', () => {
            leave_input = JSON.parse(body);
            fs.readFile(path_users, function(err, users_data){
                if(! err) {
                    let users = JSON.parse(users_data.toString());
                    let status = register.validate_user(leave_input,users);
                    if (status === 'valid') {
                        if (game.validate_leave(leave_input) === true) {
                            let leave = game.leave_game(leave_input);
                            if (leave) {
                                response.writeHead(200, headers);
                                response.end(JSON.stringify({}));
                            } else {
                                response.writeHead(400, headers);
                                response.end(JSON.stringify({'error': 'Not a valid game'}));
                            }
                        }
                    } else {
                        response.writeHead(400, headers);
                        response.end(JSON.stringify({'error': 'server error on request to'+request.url}));
                    }
                } else {
                    response.writeHead(400, headers);
                    response.end(JSON.stringify({'error': 'server error on request to'+request.url}));
                }
            });
        })
        .on('error', (err) => { 
            response.writeHead(400, headers);
            response.end(JSON.stringify({'error': 'server error on request to '+request.url}));
        });
}