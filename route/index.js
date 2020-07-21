const express = require('express') // express框架
const sha1 = require('sha1') // 第三方库 sha1算法

const WeChat = require('../wechat/wetChat')
const sqlQuery = require('../server/mysql/mysql')
const { url } = require('../config/index')
const { qiniu_img_url, host_url } = require('../config/index')

const Router = express.Router
const router = new Router()
const w = new WeChat()

// 1、语音搜索页面路由
router.get('/search', async (req, res) => {
	/*
    生成js-sdk 签名
      - 4个参数 jsapi_ticket, noncestr, timestamp, url
      - 将其进行字典排序 & 拼接
      - sha1加密
      - 生成签名
  */
	const { ticket } = await w.walkTicket()
	const noncestr = Math.round(Math.random()) + ''
	const timestamp = Date.now()
	const arr = [`jsapi_ticket=${ticket}`, `noncestr=${noncestr}`, `timestamp=${timestamp}`, `url=${url}/search`]
	const str = arr.sort().join('&')
	const signature = sha1(str)
	res.render('../views/search.ejs', {
		signature,
		noncestr,
		timestamp
	})
})

// 2、详情页面的路由
router.get('/detail/:id', async (req, res) => {
	// 获取ID
	const { id } = req.params
	if (id) {
		const sqlStr = `select * from movieInfo where movieId =${id}`
		let data = await sqlQuery(sqlStr)
		data = Array.from(data)[0]
		data.director = data.director.substr(0, 20)
		res.render('../views/detail.ejs', {
			data,
			qiniu_img_url
		})
	} else {
		res.end('error')
	}
})

// 3、电影主页
router.get('/movie', (req, res) => {
	res.redirect('https://91mjw.com')
})

// 4、预告片电影
router.get('/previewMovie', async (req, res) => {
	// 到数据库中获取数据
	const selectSql = `SELECT * FROM  qiniu
	AS a LEFT JOIN previewInfo AS b 
	ON a.movie_id = b.movieId`
	let res1 = await sqlQuery(selectSql)
	res.render('../views/previewMovie.ejs', {
		data: Array.from(res1),
		host_url
	})
})

// 5、加载弹幕的路由
router.get('/v3', async (req, res) => {
	const { id } = req.query
	// 到数据库中查找响应的电影弹幕信息
	const selectSql = `select * from dan_mu where id =${id}`
	let res1 = await sqlQuery(selectSql)
	console.log(res1)
	res1 = Array.from(res1)
	let resData = []
	res1.map(item => {
		resData.push([item.time, item.type, item.color, item.author, item.text])
	})
	res.send({
		code: 0,
		data: resData
	})
})

// 6、接受用户发送弹幕
router.post('/v3', async (req, res) => {
	// console.log(req.body) // {}
	// 将body数据结构赋值
	const { id, author, time, text, color, type } = await new Promise(resolve => {
		let body = ''
		// 弹幕信息的数据是以流式数据的
		req
			.on('data', data => {
				// buffer数据需要调用toString转化
				body += data.toString()
			})
			.on('end', () => {
				body = JSON.parse(body)
				resolve(body)
			})
	})
	// 保存用户的弹幕信息到数据库中
	// 1.创建数据表
	const createSql = `CREATE TABLE IF NOT EXISTS  dan_mu(
		id  VARCHAR(10) NOT NULL,
		author VARCHAR(50)  NOT NULL,
		time VARCHAR(50)  NOT NULL,
		text VARCHAR(50)  NOT NULL,
		color VARCHAR(50) NOT NULL,
		type VARCHAR(50)  NOT NULL,
		PRIMARY KEY (id,author,time,text,color,type)
	)`
	await sqlQuery(createSql)
	// 2.添加数据
	const insertSql = `INSERT INTO dan_mu VALUES(?,?,?,?,?,?);`
	const arr = [id, author, time + '', text, color + '', type + '']
	await sqlQuery(insertSql, arr)
	// console.log(arr)
	// 3.返回结果
	res.send({ code: 0, data: {} })
	console.log('ok')
})
/*
	1. 加载弹幕
		请求地址： http://3z0c993680.zicp.vip/v3/?id=demo
		请求方式： GET
		返回值：json字符串
		{
			code: 0,
			data: [
				[
					3.3964,    弹幕发送时间，单位s
					0,         弹幕类型
					16777215,  弹幕的颜色
					"DIYgod",  弹幕发送者
					"11111"    弹幕内容
				],
				[]
			]
		}

	2. 发送弹幕
		请求地址： http://3z0c993680.zicp.vip/v3/
		请求方式： POST
		请求体参数：
			author	DIYgod   弹幕发送者
			color	16777215   弹幕的颜色
			id	demo         弹幕的id
			text	123456     弹幕的内容
			time	0          弹幕的发送时间
			type	0          弹幕的类型
		响应内容：
		{
			"code":0,
			"data":{
			"_id":"5b8f32da5f201846fb7d4102",
			"player":"demo",
			"author":"DIYgod",
			"time":0,
			"text":"12345",
			"color":16777215,
			"type":0,
			"ip":"121.69.81.166",
			"referer":"http://3z0c993680.zicp.vip/movie",
			"date":1536111322710,
			"__v":0
		}}
*/
module.exports = router
