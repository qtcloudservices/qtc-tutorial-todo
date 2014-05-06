var todoApp = {

    start: function(){
        Backbone.history.start();
    },

    loadTemplates: function(views, callback) {
        var deferreds = [];
        $.each(views, function(index, view) {
            if (todoApp[view]) {
                deferreds.push($.get('js/tpl/' + view + '.html', function(data) {
                    todoApp[view].prototype.template = _.template(data);
                }, 'html'));
            } else {
                console.error(view + " not found");
            }
        });
        $.when.apply(null, deferreds).done(callback);
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
    },

    showPage: function(viewName, ctr){
        if (!todoApp[viewName]) {
            todoApp[viewName] = new ctr();
            todoApp[viewName].render();
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
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "/api/todos",
                data: JSON.stringify({ text: text })
            }).done(function(res, status) {
                if(status == "success" && !res.error) {
                    todoApp.todos.push(res);
                    cb(null, res);
                } else if(status == "success" && res.error) {
                    cb(res.error.code, res.error.message);
                } else {
                    cb(500, res);
                }
            })
        },
        removeTodo: function(id, cb){
            $.ajax({
                type: "DELETE",
                contentType: "application/json; charset=utf-8",
                url: "/api/todos/"+id
            }).done(function(res, status) {
                if(status == "success" && !res.error) {
                    for(var i = 0;i<todoApp.todos.length;i++){
                        if(todoApp.todos[i].id == id){
                            todoApp.todos.splice(i,1);
                            break;
                        }
                    }
                    cb(null, res);
                } else if(status == "success" && res.error) {
                    cb(res.error.code, res.error.message);
                } else {
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



$(document).on("ready", function () {
    todoApp.loadTemplates(["MainView", "HomeView", "LoginView", "RegisterView", "TodosView"], function () {
        todoApp.getSession();
        todoApp.initialize();

        // preload all todos and start app
        todoApp.api.getAllTodos(function(err, res){
            todoApp.start();
        });
    });
});