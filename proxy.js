var React = require('react')
var ReactDOM = require('react-dom')
var Peer = require('peerjs')
require('./sockjs-0.3.4')
var SockJS = window.SockJS

var Proxy = React.createClass({
  getInitialState () {
    return {peerId: null}
  },

  componentWillMount () {
    var peer = new Peer({key: process.env.PEER_KEY})

    peer.on('open', (id) => {
      console.log('My peer ID is: %c' + id, 'background-color:yellow;color:black;font-size:16px;')
      this.setState({peerId: id})
    })

    peer.on('connection', (conn) => {
      console.log('Got a connection!')
      var sock

      conn.on('data', (data) => {
        console.log('proxy got client message', data)
        sock = sock || this.initSock(conn)
        sock.send(data)
      })
    })
  },

  initSock (conn) {
    var sock = new SockJS('http://localhost:3000/sockjs')
    var sockSend = sock.send
    var batch = []

    sock.send = (data) => {
      batch.push(data)
    }

    sock.onopen = () => {
      sock.send = sockSend
      batch.forEach(function (data) {
        sock.send(data)
      })
    }

    sock.onmessage = (e) => {
      console.log('proxy got server message', e.data)
      conn.send(e.data)
    }

    sock.onclose = () => {
      console.log('close')
      conn.close()
    }

    return sock
  },

  render () {
    return (
      <div>
        <h1>My Peer ID: <span>{this.state.peerId ? this.state.peerId : 'Obtaining...'}</span></h1>
      </div>
    )
  }
})

ReactDOM.render(React.createElement(Proxy, null), document.getElementById('content'))
