Todos = new Mongo.Collection('todos')

Meteor.methods({
  addTodo: text => Todos.insert({text: text}),
  removeTodo: id => Todos.remove({_id: id})
})

Meteor.publish('todos', () => Todos.find())
