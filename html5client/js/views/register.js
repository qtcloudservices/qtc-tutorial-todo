todoApp.RegisterView = Backbone.View.extend({

    events:{
        "click #registerbutton": "register"
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
    register:function () {
        var self = this;
        var name = $("#name", this.el).val();
        var uid = $("#username", this.el).val();
        var pwd = $("#password", this.el).val();

        // clear errors
        self.hideErrors();

        // register user
        todoApp.api.register(name, uid, pwd, function(registerError, registerRes){
            if(!registerError){

                // login user
                todoApp.api.login(uid, pwd, function(loginError, loginRes){
                    if(!loginError){
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