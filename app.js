const express = require('express') // express框架
const router = require('./route/index.js') // express框架内置的router

// 自定义的中间件
const verification = require('./wechat/reply/index.js')

const app = express()

const port = 3000 // 监听的端口号

// 设置静态目录
app.use(express.static('public'))

// 配置模板引擎
app.set('view engine', 'ejs')
// 页面路由
app.use(router)
// 中间件不能出现在路由前面（ 没有调用next() ）
app.use(verification())

app.listen(port, () => console.log(`Listening on http://localhost:${port}`))
