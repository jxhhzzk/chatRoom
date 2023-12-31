//启动聊天服务端
var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)
// 记录历史消息和已登录用户

const users = []
const messages = []


server.listen(7000, () => {
  console.log('服务器成功启动')
})


app.use(require('express').static('public'))

app.get('/', function(req, res) {
  res.redirect('/index.html')
})

io.on('connection', function(socket) {
  socket.on('login', data => {

    let user = users.find(item => item.username === data.username)
  

    if (user) {
      // 用户已存在，登陆失败
      socket.emit('loginError', { msg: '登录失败，用户在聊天室' })
    } else {
      // 用户不存在, 登录成功
      console.log(data)
      users.push(data)

      socket.emit('loginSuccess', data)
      //广播系统消息
      io.emit('addUser', data)
      // 更新用户列表
      io.emit('userList', users)
      //获取历史消息
      socket.emit('messageList', messages)
      // 存储用户名和头像信息
      socket.username = data.username
      socket.avatar = data.avatar
    }


  })

  // 用户断开连接 
  socket.on('disconnect', () => {
    // 删除用户信息
    let idx = users.findIndex(item => item.username === socket.username)
    users.splice(idx, 1)
    // 广播系统消息
    io.emit('delUser', {
      username: socket.username,
      avatar: socket.avatar
    })
    // 更新用户列表
    io.emit('userList', users)
  })

  // 接收消息
  socket.on('sendMessage', data => {
    console.log(data)
    // 广播给所有用户
    io.emit('receiveMessage', data)
    messages.push(data)
  })

  // 接收图片
  socket.on('sendImage', data => {
    // 广播给所有用户
    io.emit('receiveImage', data)
  })
})
