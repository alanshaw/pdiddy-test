var React = require('react')
var ReactDOM = require('react-dom')
var PDiddy = require('pdiddy-client')

var Client = React.createClass({
  getInitialState () {
    return {
      todos: [],
      connected: false
    }
  },

  render () {
    return (
      <div>
        {this.renderConnect()}
        {this.renderAddTodo()}
        {this.renderTodoList()}
      </div>
    )
  },

  renderConnect () {
    if (this.state.connected) return
    return (
      <form onSubmit={this.onConnectSubmit}>
        <h1>Connect to peer</h1>
        <input ref='peerId' placeholder='Peer ID'/>
        <button type='submit'>Connect</button>
      </form>
    )
  },

  renderAddTodo () {
    if (!this.state.connected) return
    return (
      <form onSubmit={this.onAddTodoSubmit}>
        <h1>Add TODO</h1>
        <input ref='todoText' placeholder='What do you need TODO today?'/>
        <button type='submit'>Add</button>
      </form>
    )
  },

  renderTodoList () {
    if (!this.state.connected) return
    return (
      <ul>
        {this.state.todos.map(todo => {
          return (
            <li>
              {todo.text}
              <button onClick={this.onRemoveTodoClick} data-id={todo._id}>Remove</button>
            </li>
          )
        })}
      </ul>
    )
  },

  onConnectSubmit (e) {
    e.preventDefault()

    if (!this.refs.peerId.value) return

    var diddy = new PDiddy({key: process.env.PEER_KEY})

    // Connect to the peer
    diddy.connect(this.refs.peerId.value, err => {
      if (err) {
        return console.error('Failed to connect to peer', this.refs.peerId.value, err)
      }

      diddy.subscribe('todos', [], err => {
        if (err) return console.error('Failed to subscribe to todos', err)
      })

      diddy.observe('todos', this.onTodoChange, this.onTodoChange, this.onTodoChange)

      this.setState({connected: true})
      this.diddy = diddy
    })
  },

  onAddTodoSubmit (e) {
    e.preventDefault()

    if (!this.refs.todoText.value) return

    this.diddy.call('addTodo', [this.refs.todoText.value], err => {
      if (err) console.error('Failed to add todo', err)
      this.refs.todoText.value = ''
    })
  },

  onRemoveTodoClick (e) {
    var id = e.target.getAttribute('data-id')

    this.diddy.call('removeTodo', [id], err => {
      if (err) console.error('Failed to remove todo', err)
    })
  },

  onTodoChange () {
    console.log('todos change', arguments)
    var todos = this.diddy.collections.todos
    this.setState({todos: Object.keys(todos).map(id => todos[id])})
  }
})

ReactDOM.render(React.createElement(Client, null), document.getElementById('content'))
