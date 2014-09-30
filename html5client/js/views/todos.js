todoApp.TodosView = Backbone.View.extend({

    events:{
        "click #addtodo": "addtodo",
        "click .removetodo": "removetodo",
        "click .finishtodo": "finishtodo"
    },
    render:function () {
        this.$el.html(this.template({ todos: todoApp.todos }));
        this.delegateEvents();
        return this;
    },
    addtodo:function () {
        var self = this;
        var todotext = $("#addtodotext", this.el).val();
        if(todotext == "") return;
        todoApp.api.addTodo(todotext, function(addTodoError, addTodoRes){
            if(!addTodoError){
                // everything was smooth...
            } else {
                // the request failed for some reason; should not happen
            }
            self.render();
        });
    },
    finishtodo:function (t) {
        var self = this;
        var btnElem = t.currentTarget;
        var todoId = $(btnElem).data("todo");
        if(todoId){
            todoApp.api.finishTodo(todoId, function(updateTodoError, updateTodoRes){
                if(!updateTodoError){
                    // everything was smooth...
                } else {
                    // the request failed for some reason; should not happen
                }
                self.render();
            });
        }
    },
    removetodo:function (t) {
        var self = this;
        var btnElem = t.currentTarget;
        var todoId = $(btnElem).data("todo");
        if(todoId){
            todoApp.api.removeTodo(todoId, function(removeTodoError, removeTodoRes){
                if(!removeTodoError){
                    // everything was smooth...
                } else {
                    // the request failed for some reason; should not happen
                }
                self.render();
            });
        }
    }
});
