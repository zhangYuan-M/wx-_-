/*
	回复用户消息的统一处理模块
*/
const sha1 = require('sha1') // sha1加密算法

// 微信公众号一些固定的配置
const { token } = require('../../config/index.js')
// 工具函数
const { getUserDataAsync, parseXMlData, formatMessage } = require('../../utils/tools.js')
// 回复的模板数据
const template = require('./replyTemplate.js')
// 回复模板配置对象
const reply = require('./replyOptions.js')

module.exports = () => {
	return async (req, res, next) => {
		// 获取微信服务器发送的数据
		const { signature, echostr, timestamp, nonce } = req.query
		// 将字典排序后的数组变成字符串，无缝连接
		const str = [timestamp, nonce, token].sort().join('')
		const sha1_str = sha1(str) // sha1加密

		// 验证微信和开发者的服务器
		if (req.method === 'GET') {
			// sha1加密的字符串和 signature 对比
			if (sha1_str === signature) {
				res.send(echostr)
			} else {
				res.end('error')
			}
		}
		// 获取用户数据
		else if (req.method === 'POST') {
			// sha1加密的字符串和 signature对比
			if (sha1_str !== signature) {
				res.end('error')
			}

			// 1. 来自微信服务器 , 接受请求体数据，不能使用中间件解析，
			const xmlData = await getUserDataAsync(req)
			// 2. 解析XML数据为JS对象
			const jsObj = await parseXMlData(xmlData)
			// 3. 将JS对象格式化
			const msg = formatMessage(jsObj)

			// 4. 回复用户信息
			const options = await reply(msg)
			let replyMessage = template(options)
			res.send(replyMessage) // 返回响应给微信服务器
		}
		// 异常请求
		else {
			res.end('error')
		}
	}
}
