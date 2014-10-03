// Crypto library for hashing passwords and sessions
var crypto = require('crypto');

// Qt Cloud Services
var qtc = require('qtc');
var qtcConfig = require('../config/qtc-conf');
var mws = new qtc.Mws(qtcConfig.mws);
var eds = new qtc.Eds( qtcConfig.eds );
var todos = eds.collection('todos');
var users = eds.collection('users');
var sessions = eds.collection('sessions');

// utility function for errors
function error(code, message){
    var errorObject = {
        error:{
            code: code,
            message: message
        }
    };
    debugResponse(errorObject);
    return errorObject;
}

function resolveSession(req){
    if(req.headers['x-todo-session'] && (req.headers['x-todo-session'] != "")){
        return req.headers['x-todo-session'];
    } else if (req.query.session && (req.query.session != "")) {
        return req.query.session;
    } else if (req.cookies.session && (req.cookies.session != "")){
        return req.cookies.session;
    }
    return null;
}

function authenticateRequest(req, cb){
    var session = resolveSession(req);

    // no session available
    if(!session || session == "") { cb(403, "Access denied!"); return; }

    // verify session
    sessions.find({ session: session }, function(e, existingsessions) {
        if(!e) {
            if(existingsessions.length == 0) {
                // invalid session
                cb(403, "Access denied!");
            } else {
                // valid session
                var validSession = existingsessions[0];

                // clean-up
                delete validSession.objectType;
                delete validSession.createdAt;
                delete validSession.updatedAt;

                cb(null, existingsessions[0]);
            }
        } else {
            cb(e, existingsessions);
        }
    });
}

function cleanTodo(data){
    if(data.length){
        for(var i=0; i<data.length; i++){
            delete data[i].objectType;
            delete data[i].userId;
        }
    } else {
        delete data.objectType;
        delete data.userId;
    }
    return data;
}

function debugRequest(req){
    console.log("-->", req.method, req.url);
}

function debugResponse(data){
    console.log("<--", data);
}

module.exports = function(app) {
    app.get('/api/websocket', function(req, res) {
      authenticateRequest(req, function(e, session){
          if(!e){

            mws.createSocket(["user:"+session.userId], function(e, mwsResponse) {
              res.json(mwsResponse);
            });
          } else {
              res.json(error(403, "Access Denied!"));

          }
        });
    });

    app.post('/api/websocket/messages', function(req, res) {
      debugRequest(req);
      var payload = req.body.payload;
      console.log('got websocket request:')
      console.log(payload)

      mws.send(JSON.stringify(payload), { sockets: null, tags: [payload.object.userId] }, function(e, mwsResponse) {
        console.log('send websocket message:');
        console.log(mwsResponse);
        res.json(mwsResponse);
      })

    });

    app.post('/api/register', function(req, res) {
        debugRequest(req);
        var pwdhash = crypto.createHash('sha1');

        // user object
        var userObject = {
            name: req.body.name,
            username: req.body.username,
            password: pwdhash.update(req.body.password).digest('hex')
        };

        // check username is not already taken
        users.find({ username: userObject.username }, function(e, existingusers) {

            // something wring with our query; return error
            if (e) { res.json(error(500, "Unable to verify existing users!")); return; }

            // the user already exists
            if (existingusers.length > 0) { res.json(error(403, "User already exists.")); return; }

            // create new user
            users.insert(userObject, function(e, user) {
                if (e) { res.json(error(500, "Unable to create new user!")); return; }

                // clean-up response
                delete user.objectType;
                delete user.createdAt;
                delete user.updatedAt;
                delete user.password;

                // return the user object
                res.json(user);
                debugResponse(user);
            });
        });
    });

    app.post('/api/login', function(req, res) {
        debugRequest(req);

        var pwdhash = crypto.createHash('sha1');
        var sessionhash = crypto.createHash('sha1');

        var data = req.body;
        if(!data.username || !data.password) { res.json(error(400, "Bad Request!")); return; }

        var username = data.username;
        var password = pwdhash.update(data.password).digest('hex');

        // check if the user exists with given username/password
        users.find({ username: username, password: password }, function(e, existingusers) {

            // something wring with our query; return error
            if (e) { res.json(error(500, "Unable to verify existing users!")); return; }

            // the username/password does not match
            if (existingusers.length == 0) { res.json(error(403, "Username/password does not match.")); return; }

            // create new session
            var newSession = sessionhash.update( "Qt Cloud Services!" + Date.now() ).digest('hex');
            var sessionObject = {
                session: newSession,
                userId: existingusers[0].id,
                name: existingusers[0].name
            };

            // todo: check if user already has a session

            // create new session
            sessions.insert(sessionObject, function(e, session){

                // something wring with our query; return error
                if (e) { res.json(error(500, "Unable to store session!")); return; }

                // return the session
                res.json(session);
                debugResponse(session);
            });
        });
    });

    app.get('/api/me', function(req, res) {
        debugRequest(req);
        authenticateRequest(req, function(e, session){
            if(!e){
                delete session.id;
                res.json(session);
                debugResponse(session);
            } else {
                res.json(error(403, "Access Denied!"));
            }
        });
    });

    app.get('/api/logout', function(req, res) {
        debugRequest(req);
        authenticateRequest(req, function(e, session){
            if(!e){
                sessions.remove(session.id, function(e, r) {
                    if(!e) {
                        res.json({logout: true});
                        debugResponse({logout: true});
                    } else {
                        res.json(error(403, "Access Denied!"));
                    }
               });
            } else {
                res.json(error(403, "Access Denied!"));
            }
        });
    });

    /*
     * CRUD: TODOS
     */
	app.get('/api/todos', function(req, res) {
        debugRequest(req);
        authenticateRequest(req, function(e, session){
            if(!e){
                todos.find(
                    { userId: "user:"+session.userId },
                    {
                        sort: [
                            {"sortBy": "done", "direction": "asc"} ,
                            {"sortBy": "updatedAt", "direction": "desc"}
                        ]
                    }, function(err, todos) {
                    // error; should not happen
                    if (err) { res.json(err); return; }

                    // successful; return json
                    res.json(cleanTodo(todos));
                });
            } else {
                res.json(error(403, "Access Denied!"));
            }
        });
	});

	app.post('/api/todos', function(req, res) {
        debugRequest(req);
        authenticateRequest(req, function(e, session){
            if(!e){

                todos.insert({
                    userId: "user:"+session.userId,
                    text : req.body.text,
                    done : false,
                    device : req.body.device || ""
                }, function(err, todoItem) {
                    if (err) { res.json(err); return; }

                    // successful; return new item
                    res.json(cleanTodo(todoItem));
                });
            } else {
                res.json(error(403, "Access Denied!"));
            }
        });
	});

    app.get('/api/todos/:todo_id', function(req, res) {
        debugRequest(req);
        authenticateRequest(req, function(e, session){
            if(!e){
                todos.find({id: req.params.todo_id, userId: "user:"+session.userId}, function(err, todoItem) {
                    if (err) { res.json(err); return; }

                    // successful; return item or not found
                    if(todoItem.length > 0) {
                        res.json(cleanTodo(todoItem[0]));
                    } else {
                        res.json(error(404, "Not found!"));
                    }
                });
            } else {
                res.json(error(403, "Access Denied!"));
            }
        });
    });

    app.put('/api/todos/:todo_id', function(req, res) {
        debugRequest(req);
        authenticateRequest(req, function(e, session){
            if(!e){
                // for security reason, check the object is owned by the user
                todos.find({id: req.params.todo_id, userId: "user:"+session.userId}, function(err, todoItem) {
                    if (err) { res.json(err); return; }

                    // successful; update object or return not found
                    if(todoItem.length > 0) {

                        // create updated object
                        var updatedTodo = {};
                        if(typeof req.body.text != "undefined") updatedTodo.text = req.body.text;
                        if(typeof req.body.done != "undefined") updatedTodo.done = req.body.done;
                        if(typeof req.body.device != "undefined") updatedTodo.device = req.body.device;

                        todos.update(req.params.todo_id, updatedTodo, function (err, todoItem) {
                            if (err) { res.json(err); return; }

                            // successful; return updated object
                            res.json(cleanTodo(todoItem));
                        });

                    } else {
                        res.json(error(404, "Not found!"));
                    }
                });
            } else {
                res.json(error(403, "Access Denied!"));
            }
        });
    });

	app.delete('/api/todos/:todo_id', function(req, res) {
        debugRequest(req);
        authenticateRequest(req, function(e, session){
            if(!e){
                // for security reason, check the object is owned by the user
                todos.find({id: req.params.todo_id, userId: "user:"+session.userId}, function(err, todoItem) {
                    if (err) { res.json(err); return; }

                    // successful; delete item or not found
                    if(todoItem.length > 0) {

                        todos.remove(req.params.todo_id, function(err, todoItem) {
                            if (err) { res.json(err); return; }

                            // successful; return deleted status
                            res.json({ deleted: req.params.todo_id });
                        });

                    } else {
                        res.json(error(404, "Not found!"));
                    }
                });
            } else {
                res.json(error(403, "Access Denied!"));
            }
        });
	});

};
