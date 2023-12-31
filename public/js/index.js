var socket = io('http://localhost:7000')
sessionStorage.setItem('username', '未获取')
sessionStorage.setItem('avatar', '未获取')



$('#loginAvatar li').on('click', function() {
  $(this).addClass('now').siblings().removeClass('now')
})

$('#loginButton').on('click', function() {
  // 获取用户名
  var username = $('#username').val().trim()
  if (!username) {
    alert('请输入用户名')
    return
  }
  //获取密码
  var password = $('#password').val().trim()
  if (!password) {
  alert('请输入密码')
  return
}
  // 获取头像
  var avatar = $('#loginAvatar li.now img').attr('src')
  // 发送登录事件
  socket.emit('login', {
    username: username,
    avatar: avatar,
    password: password
  })
})

// 登录失败
socket.on('loginError', data => {
  alert('用户名已经存在')
})
// 登录成功
socket.on('loginSuccess', data => {
  $('.loginBox').fadeOut()
  $('.chatBox').fadeIn()
  console.log(data)
  $('.avatarUrl').attr('src', data.avatar)
  $('.systemMessage .username').text(data.username)
  


  sessionStorage.setItem('username', data.username)
  sessionStorage.setItem('avatar', data.avatar)
})

// 新用户加入
socket.on('addUser', data => {

  $('.systemMessage').append(`
  <div class="system">
    <p class="messageSystem">
      <span class="content">${data.username}加入了聊天室</span>
    </p>
  </div>
`)


  scrollIntoView()
})

socket.on('messageList',data=>{
  // 添加历史消息
  $('.boxMiddle').html('')
  data.forEach(item => {
    $('.boxMiddle').append(`
      <div class="messageBox">
        <div class="other message">
          <img class="avatar" src="${item.avatar}" alt="" />
          <div class="content">
            <div class="nickname">${item.username}</div>
            <div class="bubble">
              <div class="bubbleContent">${item.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
  })
})



// 更新用户列表
socket.on('userList', data => {
  $('.userList ul').html('')
  data.forEach(item => {
    $('.userList ul').append(`
      <li class="user">
        <div class="avatar"><img src="${item.avatar}" alt="" /></div>
        <div class="name">${item.username}</div>
      </li>      
    `)
  })

  $('#userCount').text(data.length)
})

// 用户离开
socket.on('delUser', data => {
  $('.systemMessage').append(`
  <div class="system">
    <p class="messageSystem">
      <span class="content">${data.username}离开了聊天室</span>
    </p>
  </div>
`)
  scrollIntoView()
})



// 发送聊天消息
$('.sendButton').on('click', () => {
  // 获取到聊天的内容
  var content = $('#content').html()
  $('#content').html('')
  if (!content) return alert('请输入聊天消息')

  // 把消息传给服务器
  socket.emit('sendMessage', {
    msg: content,
    username:sessionStorage.getItem('username'),
    avatar:sessionStorage.getItem('avatar')

  })
})

// 获取聊天消息
socket.on('receiveMessage', data => {
  if (data.username === sessionStorage.getItem('username')) {
    // 自己的消息
    $('.boxMiddle').append(`
      <div class="messageBox">
        <div class="my message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubbleContent">${data.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
  } else {
    // 别人的消息
    $('.boxMiddle').append(`
      <div class="messageBox">
        <div class="other message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="nickname">${data.username}</div>
            <div class="bubble">
              <div class="bubbleContent">${data.msg}</div>
            </div>
          </div>
        </div>
      </div>
    `)
  }
  scrollIntoView()
})

function scrollIntoView() {
  // 当前元素的底部滚动到可视区
  $('.boxMiddle').children(':last').get(0).scrollIntoView(false)
}

// 发送图片
$('#file').on('change', function() {
  var file = this.files[0]
  var fr = new FileReader()
  fr.readAsDataURL(file)
  fr.onload = function() {
    socket.emit('sendImage', {
      username: sessionStorage.getItem('username'),
      avatar: sessionStorage.getItem('avatar'),
      img: fr.result
    })
  }
})

// 获取图片聊天信息
socket.on('receiveImage', data => {
  if (data.username === sessionStorage.getItem('username')) {
    // 自己的消息
    $('.boxMiddle').append(`
      <div class="messageBox">
        <div class="my message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="bubble">
              <div class="bubbleContent">
                <img src="${data.img}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
  } else {
    // 别人的消息
    $('.boxMiddle').append(`
      <div class="messageBox">
        <div class="other message">
          <img class="avatar" src="${data.avatar}" alt="" />
          <div class="content">
            <div class="nickname">${data.username}</div>
            <div class="bubble">
              <div class="bubbleContent">
                <img src="${data.img}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
  }

  $('.boxMiddle img:last').on('load', function() {
    scrollIntoView()
  })
})


