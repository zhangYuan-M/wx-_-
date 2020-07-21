// 在服务端发起ajax请求
const axios = require('axios')
//只需要引入request-promise-native
const rp = require('request-promise-native')
const request = require('request')
// node内置模块
const { resolve, join } = require('path')
// 安装了axios就自动有这个qs模块
const qs = require('qs')

// 微信公众号一些固定的配置
const { appID, appsecret } = require('../config/index.js')
// 工具包函数
const { writeFileAsync, readFileAsync } = require('../utils/tools')
// 流式文件传输
const { createReadStream, createWriteStream } = require('fs')

// 微信公众号类
class WeChat {
	constructor() {
		// 使用绝对路径
		this.savePath = resolve(__dirname, '../config/accessToken.txt')
		this.saveTicketPath = resolve(__dirname, '../config/ticket.txt')
		this.materialPath = resolve(__dirname, '../public/media')
	}
	// 1、获取全局access_token
	/**
	 * 从微信服务器，获取accessToken数据
	 * @returns Promise<any> 返回的promise中包含access_token 和被重写的 expires_in
	 */
	getAccessToken() {
		return new Promise((res, rej) => {
			const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`
			axios
				.get(url)
				.then(response => {
					const { data } = response
					// expires_in (access_token有效期) 被重写
					data.expires_in = Date.now() + (data.expires_in - 300) * 1000
					res(data)
				})
				.catch(err => {
					rej('getAccessToken 出问题了~ ')
				})
		})
	}
	/**
	 * 保存accessToken方法
	 * @param string accessToken 要保存的凭据
	 * @returns 返回的promise包含 true:代表数据保存本地成功。 false:代表数据保存本地失败
	 */
	saveAccessToken(accessToken) {
		return writeFileAsync(accessToken, this.savePath)
	}
	/**
	 * 读取accessToken方法
	 * @returns 返回的promise包含 成功返回读取的内容，失败返回失败的提示
	 */
	readAccessToken() {
		return readFileAsync(this.savePath)
	}
	/**
	 * 检查access_token是否有效
	 * @param Object tokenData 从微信服务器获取的对象
	 * @returns 返回单Promise包含 false:说明传入参数无效,或者过期。true: 说明没有过期
	 */
	isValiadAccessToken(tokenData) {
		if (!tokenData && !tokenData.expires_in && !tokenData.access_token) {
			return false
		}
		return tokenData.expires_in > Date.now()
	}
	/**
	 * 请求access_token
	 */
	async handleAccessToken() {
		const res = await this.getAccessToken()
		const isSave = await this.saveAccessToken(res)
		// 保存在对象上
		this.__proto__.tokenObj = res

		// 保存数据成功
		if (isSave) {
			// return await this.readAccessToken()
			return res
		} else {
			console.log('数据保存本地失败')
		}
	}
	/**
	 * 处理access_token最终方法
	 */
	walkAccessToken() {
		//优化
		if (this.tokenObj && this.isValiadAccessToken(this.tokenObj)) {
			console.log('走优化道路')
			//说明之前保存过access_token，并且它是有效的, 直接使用
			// 这里要注意：必须同一个对象，如果创建多个weChat实例对象
			return Promise.resolve({ ...this.tokenObj })
		}

		return this.readAccessToken().then(
			// 代表文件存在
			async res => {
				console.log('文件存在')
				// 验证文件是否过期
				const isvalidate = this.isValiadAccessToken(res)
				// 如果文件过期
				if (!isvalidate) {
					const foo = await this.handleAccessToken()
					return foo
				}
				// 如果文件没有过期，就直接返回数据
				else {
					return res
				}
			},
			// 代表文件不存在
			async err => {
				console.log('文件不存在')
				return await this.handleAccessToken()
			}
		)
	}

	// 2、获取js-sdk ticket
	/**
	 * 从微信服务器，获取js-sdk ticket数据
	 * @returns Promise<any> 返回的promise中包含 ticket 和被重写的 expires_in
	 */
	getTicket() {
		return new Promise(async (res, rej) => {
			const token = await this.walkAccessToken()
			const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token.access_token}&type=jsapi`
			axios
				.get(url)
				.then(response => {
					const { data } = response
					res({
						ticket: data.ticket,
						expires_in: Date.now() + (data.expires_in - 300) * 1000
					})
				})
				.catch(err => {
					rej('getTicket 出问题了~ ')
				})
		})
	}
	/**
	 * 保存accessToken方法
	 * @param string accessToken 要保存的凭据
	 * @returns 返回的promise包含 true:代表数据保存本地成功。 false:代表数据保存本地失败
	 */
	saveTicket(ticket) {
		return writeFileAsync(ticket, this.saveTicketPath)
	}
	/**
	 * 读取ticket方法
	 * @returns 返回的promise包含 成功返回读取的内容，失败返回失败的提示
	 */
	readTicket() {
		return readFileAsync(this.saveTicketPath)
	}
	/**
	 * 检查ticket是否有效
	 * @param Object tokenData 从微信服务器获取的对象
	 * @returns 返回单Promise包含 false:说明传入参数无效,或者过期。true: 说明没有过期
	 */
	isValiadTicket(tokenData) {
		if (!tokenData && !tokenData.expires_in && !tokenData.access_token) {
			return false
		}
		return tokenData.expires_in > Date.now()
	}
	/**
	 * 请求Ticket
	 */
	async handleTicket() {
		const res = await this.getTicket()
		const isSave = await this.saveTicket(res)
		// 保存在对象上
		this.__proto__.ticketTokenObj = res

		// 保存数据成功
		if (isSave) {
			return res
		} else {
			console.log('数据保存本地失败')
		}
	}
	/**
	 * 处理Ticket最终方法
	 */
	walkTicket() {
		//优化
		if (this.ticketTokenObj && this.isValiadTicket(this.ticketTokenObj)) {
			console.log('走优化道路')
			//说明之前保存过access_token，并且它是有效的, 直接使用
			// 这里要注意：必须同一个对象，如果创建多个weChat实例对象
			return Promise.resolve({ ...this.ticketTokenObj })
		}
		return this.readTicket().then(
			// 代表文件存在
			async res => {
				console.log('文件存在')
				// 验证文件是否过期
				const isvalidate = this.isValiadTicket(res)
				// 如果文件过期
				if (!isvalidate) {
					const foo = await this.handleTicket()
					return foo
				}
				// 如果文件没有过期，就直接返回数据
				else {
					return res
				}
			},
			// 代表文件不存在
			async err => {
				console.log('文件不存在')
				return await this.handleTicket()
			}
		)
	}

	// 3、自定义菜单
	/**
	 * 创建自定义菜单
	 * @param Object menu
	 */
	createMenu(menu) {
		return new Promise(async (res, rej) => {
			try {
				const data = await this.walkAccessToken()
				const url = `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${data.access_token}`
				// 发送请求
				const result = await axios({ url, method: 'post', data: menu })
				res(result)
			} catch (error) {
				rej('createMenu 出问题' + error)
			}
		})
	}
	/**
	 * 删除自定义菜单
	 */
	deleteMenu() {
		return new Promise(async (res, rej) => {
			try {
				const data = await this.walkAccessToken()
				const url = `https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${data.access_token}`
				// 发送请求
				const result = await axios({ url, method: 'get' })
				res(result)
			} catch (error) {
				rej('deleteMenu 出问题' + error)
			}
		})
	}

	// 4、上传临时素材(有错误)
	/**
	 * @param type 上传文件的类型
	 * @param fileName 上传文件的名称
	 */
	_uploadTemporaryMaterial(type, fileName) {
		return new Promise(async (res, rej) => {
			// 获取access_token数据
			const token = await this.walkAccessToken()
			// 上传文件的URL
			const url = `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token.access_token}&type=${type}`
			const filePath = this.materialPath + '/' + fileName
			const formData = {
				media: createReadStream(filePath)
			}

			axios
				.post(
					url,
					// 2、将请求数据转换为form-data格式
					qs.stringify(formData),
					// 3、设置请求头Content-Type
					{ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
				)
				.then(res => {
					console.log(res.data)
				})
				.catch(error => {
					console.log('1111111111111')
				})
		})
	}

	// 上传临时素材
	uploadTemporaryMaterial(type, fileName) {
		//获取文件的绝对路径
		const filePath = this.materialPath + '/' + fileName

		return new Promise(async (resolve, reject) => {
			//放置可能出错的代码
			try {
				//获取access_token
				const token = await this.walkAccessToken()
				//定义请求地址
				const url = `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token.access_token}&type=${type}`

				const formData = {
					media: createReadStream(filePath)
				}
				//以form表单的方式发送请求
				const result = await rp({ method: 'POST', url, json: true, formData })
				//将数据返回给用户
				resolve(result)
			} catch (e) {
				//一旦try中的代码出了问题，就会走catch逻辑，处理错误
				reject('uploadTemporaryMaterial方法出了问题：------' + e)
			}
		})
	}
	// (下载)获取临时素材
	getTemporaryMaterial(type, mediaId, fileName) {
		//获取文件的绝对路径
		const filePath = this.materialPath + '/' + fileName

		return new Promise(async (resolve, reject) => {
			//获取access_token
			const token = await this.walkAccessToken()
			//定义请求地址
			let url = `https://api.weixin.qq.com/cgi-bin/media/get?access_token=${token.access_token}&media_id=${mediaId}`
			//判断是否是视频文件
			if (type === 'video') {
				//视频文件只支持http协议
				// url = url.replace('https://', 'http://')
				console.log(url)
				//发送请求
				const data = await rp({ method: 'GET', url, json: true })
				//返回出去
				resolve(data)
			} else {
				//其他类型文件
				request(url)
					//当文件读取完毕时，可读流会自动关闭，一旦关闭触发close事件，从而调用resolve方法通知外部文件读取完毕了
					.pipe(createWriteStream(filePath))
					.on('close', () => {
						resolve()
					})
			}
		})
	}

	//上传永久素材
	/**
	 * @param type 上传文件的类型
	 * @param material 上传文件的文件名或者上传图文的资源
	 */
	uploadPermanentMaterial(type, material, body) {
		return new Promise(async (resolve, reject) => {
			try {
				//获取access_token
				const data = await this.walkAccessToken()
				//请求的配置对象
				let options = {
					method: 'POST',
					json: true
				}
				//上传图文消息
				if (type === 'news') {
					options.url = `https://api.weixin.qq.com/cgi-bin/material/add_news?access_token=${data.access_token}`
					options.body = material // 文章的内容，可以是HTML类型
				}
				//上传图文消息中的图片
				else if (type === 'pic') {
					options.url = `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${data.access_token}`
					options.formData = {
						// 创建可读流
						media: createReadStream(join(__dirname, '../public/media/', material))
					}
				}
				// 上传其他类型的素材
				else {
					//其他媒体素材的上传
					options.url = `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${data.access_token}&type=${type}`
					console.log(options.url)
					options.formData = {
						media: createReadStream(join(__dirname, '../public/media/', material))
					}
					//视频素材，需要多提交一个表单
					if (type === 'video') {
						options.body = body // body 内容见文档
					}
				}

				//发送请求
				const result = await rp(options)
				//将返回值返回出去
				resolve(result)
			} catch (e) {
				reject('uploadPermanentMaterial方法出了问题：' + e)
			}
		})
	}
	//获取永久素材
	getPermanentMaterial(type, mediaId, fileName) {
		return new Promise(async (resolve, reject) => {
			try {
				//获取access_token
				const data = await this.walkAccessToken()
				//定义请求地址
				const url = `https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=${data.access_token}`

				// 请求的配置
				const options = { method: 'POST', url, json: true, body: { media_id: mediaId } }
				// 发送请求, 图文和视屏的类型
				if (type === 'news' || 'video') {
					const data = await rp(options)
					resolve(data)
				}
				// 其他类型的素材消息，则响应的直接为素材的内容，开发者可以自行保存为文件
				else {
					request(options)
						.pipe(createWriteStream(join(__dirname, '../public/media/', fileName)))
						.once('close', resolve)
				}
			} catch (e) {
				reject('getPermanentMaterial方法出了问题：' + e)
			}
		})
	}

	// 封装临时和永久的上传素材
	uploadMaterial(type, material, body, isPermanent) {
		return new Promise(async (resolve, reject) => {
			try {
				//获取access_token
				const data = await this.walkAccessToken()
				//默认的请求的配置对象
				let options = {
					method: 'POST',
					json: true,
					formData: {
						media: createReadStream(join(__dirname, '../public/media/', material))
					}
				}
				//永久素材逻辑
				if (isPermanent) {
					//上传图文消息
					if (type === 'news') {
						options.url = `https://api.weixin.qq.com/cgi-bin/material/add_news?access_token=${data.access_token}`
						options.body = material
						options.formData = null
					}
					//上传图文消息中的图片
					else if (type === 'pic') {
						options.url = `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${data.access_token}`
					}
					//其他媒体素材的上传
					else {
						options.url = `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${data.access_token}&type=${type}`
						//视频素材，需要多提交一个表单
						if (type === 'video') {
							options.body = body
						}
					}
				}
				//临时素材逻辑
				else {
					const url = `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${data.access_token}&type=${type}`
					options.url = url
				}

				//发送请求
				const result = await rp(options)
				//将返回值返回出去
				resolve(result)
			} catch (e) {
				reject('uploadMaterial方法出了问题：' + e)
			}
		})
	}
}
module.exports = WeChat
