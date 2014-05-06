todoApp.LoginView = Backbone.View.extend({

    events:{
        "click #loginbutton": "login"
    },
    render:function () {
        this.$el.html(this.template());
        return this;
    },
    showErrors:function(){
        $(".form-group", this.el).addClass("has-error has-feedback");
        $(".form-group span", this.el).removeClass("hide");
    },
    hideErrors:function(){
        $(".form-group", this.el).removeClass("has-error has-feedback");
        $(".form-group span", this.el).addClass("hide");
    },
    login:function () {
        var self = this;
        var uid = $("#username", this.el).val();
        var pwd = $("#password", this.el).val();

        // clear errors
        self.hideErrors();

        // do login
        todoApp.api.login(uid, pwd, function(loginError,loginRes){
            if(!loginError){

                todoApp.todos = [];

                // fetch all todos
                todoApp.api.getAllTodos(function(allTodosError, allTodosRes) {
                    if(!allTodosError){
                        // everything was smooth...
                    } else {
                        // this should never happen...
                    }

                    // show todos
                    todoApp.router.navigate("todos", {trigger: true});
                });
            } else {
                self.showErrors(loginError);
            }
        });
    }
});