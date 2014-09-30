var todoApp = {

    start: function(){
        Backbone.history.start();
    },

    loadTemplates: function(views) {
        var deferreds = [];
        $.each(views, function(index, view) {
            if (todoApp[view]) {
              // override template() method to render template element from index html
              todoApp[view].prototype.template = _.template($("#"+view).html());

            } else {
                console.error(view + " not found");
            }
        });
    },

    setSession: function(username, session){
        todoApp.session = session;
        todoApp.username = username;
        $.cookie('session', session);
        $.cookie('username', username);
        this.updateUserMenu();
    },

    clearSession: function(){
        todoApp.session = "";
        todoApp.username = "";
        $.cookie('session', "");
        $.cookie('username', "");
        this.updateUserMenu();
    },

    getSession: function(){
        todoApp.session = $.cookie('session');
        todoApp.username = $.cookie('username');
        this.updateUserMenu();
    },

    updateUserMenu: function(){
        if(todoApp.session != ""){
            $("#loggedInUserName").removeClass("hide").html(todoApp.username);
            $("#logoutMenuItem").removeClass("hide");
            $("#loginMenuItem").addClass("hide");
        } else {
            $("#loggedInUserName").addClass("hide").html("");
            $("#logoutMenuItem").addClass("hide");
            $("#loginMenuItem").removeClass("hide");
        }
    },

    initialize: function(){
        todoApp.mainView = new todoApp.MainView();
        todoApp.mainView.render();
        $("body").html(todoApp.mainView.el);
        todoApp.$main = $("#main");
        todoApp.device = Math.random().toString(36).substring(7);
    },

    openWebSocketConnection: function(){
      $.ajax({
          type: "GET",
          contentType: "application/json; charset=utf-8",
          url: "/api/websocket"
      }).done(function(res, status) {
          if(status == "success") {
              var options = {
                uri: res.uri
              }
              todoApp.ws.connectToWebsocket(options);
          }
      })
    },

    showPage: function(viewName, ctr){
        if (!todoApp[viewName]) {
            todoApp[viewName] = new ctr();
        }
        todoApp[viewName].render();
        todoApp.$main.html(todoApp[viewName].el);
        todoApp[viewName].delegateEvents();
    },

    htmlDecode: function(str) {
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
};

// add API
(function() {
    todoApp.api = {
        getAllTodos: function(cb){
            if(todoApp.session && (todoApp.session != "")){
                $.ajax({
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    url: "/api/todos"
                }).done(function(res, status) {
                    if(status == "success" && !res.error) {
                        todoApp.todos = res;
                        cb(null, res);
                    } else if(status == "success" && res.error) {
                        todoApp.todos = [];
                        cb(res.error.code, res.error.message);
                    } else {
                        todoApp.todos = [];
                        cb(500, res);
                    }
                })
            } else {
                todoApp.todos = [];
                cb(403, "Access Denied!");
            }
        },
        addTodo: function(text, cb){
            var todo = {text: text, device: todoApp.device}

            todoApp.todos.unshift(todo);
            cb(null, todo);
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "/api/todos",
                data: JSON.stringify(todo)
            }).done(function(res, status) {
                if(status == "success" && !res.error) {
                    todoApp.todos[_.indexOf(todoApp.todos, todo)] = res;
                    cb(null, res);
                } else if(status == "success" && res.error) {
                    todoApp.todos.shift();
                    cb(res.error.code, res.error.message);
                } else {
                    todoApp.todos.shift();
                    cb(500, res);
                }
            })
        },
        finishTodo: function(id, cb){
            var todo = null;
            for(var i = 0;i<todoApp.todos.length;i++){
                if(todoApp.todos[i].id == id){
                    todo = todoApp.todos[i];
                    todo.device = todoApp.device;
                    todo.done = true;
                    break;
                }
            }
            cb(null, todo);
            $.ajax({
                type: "PUT",
                contentType: "application/json; charset=utf-8",
                url: "/api/todos/"+id,
                data: JSON.stringify(todo)
            }).done(function(res, status) {
                if(status == "success" && !res.error) {

                } else if(status == "success" && res.error) {
                    cb(res.error.code, res.error.message);
                } else {
                    cb(500, res);
                }
            })
        },
        removeTodo: function(id, cb){
            var todo = null;
            for(var i = 0;i<todoApp.todos.length;i++){
                if(todoApp.todos[i].id == id){
                    todo = todoApp.todos[i];
                    todoApp.todos.splice(i,1);
                    break;
                }
            }
            cb(null, todo);
            $.ajax({
                type: "DELETE",
                contentType: "application/json; charset=utf-8",
                url: "/api/todos/"+id
            }).done(function(res, status) {
                if(status == "success" && !res.error) {

                } else if(status == "success" && res.error) {
                    todoApp.todos.splice(i, 1, todo);
                    cb(res.error.code, res.error.message);
                } else {
                    todoApp.todos.splice(i, 1, todo);
                    cb(500, res);
                }
            })
        },
        login: function(username, password, cb){
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "/api/login",
                data: JSON.stringify({ username: username, password: password })
            }).done(function(res, status) {
                if(status == "success" && !res.error) {
                    todoApp.setSession(res.name, res.session);
                    cb(null, res);
                } else if(status == "success" && res.error) {
                    cb(res.error.code, res.error.message);
                } else {
                    cb(500, res);
                }
            })
        },
        logout: function(cb){
            if(todoApp.session && (todoApp.session != "")) {
                $.ajax({
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    url: "/api/logout"
                }).done(function (res, status) {
                    if (status == "success" && !res.error) {
                        todoApp.clearSession();
                        if(res.alreadyLoggedOut) {
                            cb(null, "Already logged out");
                        } else {
                            cb(null, "Logged out");
                        }
                    } else if (status == "success" && res.error) {
                        cb(res.error.code, res.error.message);
                    } else {
                        cb(500, res);
                    }
                })
            } else {
                cb(null, "Already logged out");
            }
        },
        register: function(name, username, password, cb){
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "/api/register",
                data: JSON.stringify({ name: name, username: username, password: password })
            }).done(function(res, status) {
                if(status == "success" && !res.error) {
                    cb(null, res);
                } else if(status == "success" && res.error) {
                    cb(res.error.code, res.error.message);
                } else {
                    cb(500, res);
                }
            })
        }

    };
})(todoApp);

// add router
(function() {
    var router = Backbone.Router.extend({
        routes: {
            "":             "home",
            "todos":        "todos",
            "login":        "login",
            "logout":       "logout",
            "signup":       "signup"
        },
        home: function () {
            // if user is logged in, show todos
            if(todoApp.session && (todoApp.session != "")){
                todoApp.router.navigate("todos", {trigger: true});
                return;
            }
            todoApp.showPage("homeView", todoApp.HomeView);
        },
        todos: function () {
            if(!todoApp.session || (todoApp.session == "")){
                // user is not logged in, redirect to homepage
                todoApp.router.navigate("", {trigger: true});
                return;
            }
            if(!todoApp.ws.socket) {
              todoApp.openWebSocketConnection();
            }
            todoApp.showPage("todosView", todoApp.TodosView);
        },
        login: function () { todoApp.showPage("loginView", todoApp.LoginView); },
        signup: function () { todoApp.showPage("registerView", todoApp.RegisterView); },
        logout: function () {
            todoApp.api.logout(function(){
                todoApp.router.navigate("", {trigger: true});
            });
        }
    });

    todoApp.router = new router();

})(todoApp);

// add WebSocket
(function() {
  todoApp.ws = {
    connectToWebsocket: function(options) {
      $.ajax({
          url: options.mwsUri,
          success: function(response) {
              // connect to websocket using returned uri
              if(todoApp.ws.socket) {
                todoApp.ws.socket.close();
              }
              var socket = new WebSocket(options.uri);
              socket.onopen = function(event) {
                console.log('Connected to WebSocket')
              },
              socket.onmessage = function(event) {
                todoApp.ws.handleMessage(JSON.parse(event.data));
              };

              todoApp.ws.socket = socket;
          },
          error: function(response) {
              console.log("Ooops! Something went wrong!", response.responseText)
          }
      })
    },
    handleMessage: function(message) {
      console.log('handle websocket message', message)
      if(todoApp.session) {
        if(message.object.device != todoApp.device) {
          if(message.meta.eventName == "create") {
            todoApp.todos.unshift(message.object);
          }

          if(message.meta.eventName == "update") {
            var todo;
            for(var i = 0;i<todoApp.todos.length;i++){
                if(todoApp.todos[i].id == message.object.id){
                    todo = todoApp.todos[i];
                    todo.done = true;
                    break;
                }
            }
          }
        }
        if(message.meta.eventName == "delete") {
          var todo = null;
          for(var i = 0;i<todoApp.todos.length;i++){
              if(todoApp.todos[i].id == message.object.id){
                  todo = todoApp.todos[i];
                  todoApp.todos.splice(i,1);
                  break;
              }
          }
        }
        todoApp.showPage("todosView", todoApp.TodosView);
      }
    }
  }
})(todoApp);

$(document).on("ready", function () {
    todoApp.loadTemplates(["MainView", "HomeView", "LoginView", "RegisterView", "TodosView"]);
    todoApp.getSession();
    todoApp.initialize();

    // preload all todos and start app
    todoApp.api.getAllTodos(function(err, res){
        todoApp.start();
    });
});
