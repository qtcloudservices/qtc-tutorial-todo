todoApp.MainView = Backbone.View.extend({

    render:function () {
        this.$el.html(this.template({name: todoApp.username, session: todoApp.session}));
        return this;
    }

});