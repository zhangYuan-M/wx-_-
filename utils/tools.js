const { parseString } = require('xml2js') // 将xml数据 变为js对象
const fs = require('fs')

module.exports = {
	// 获取用户数据
	getUserDataAsync(req) {
		return new Promise((res, rej) => {
			let xmlData = ''
			req
				.on('data', data => {
					// 当流式数据传递过来的时候，会将数据注入到回调函数中
					// data是buffer数据，要转化为字符串
					xmlData += data.toString()
				})
				.on('end', () => {
					// 当数据接受完毕触发事件
					res(xmlData)
				})
		})
	},
	// 将XML解析为JS对象
	parseXMlData(xmlData) {
		return new Promise((res, rej) => {
			parseString(xmlData, { trim: true }, (err, data) => {
				if (!err) {
					res(data)
				} else {
					rej('parseXMlData 出了问题' + err)
				}
			})
		})
	},
	// 将JS对象过滤不要的数据
	formatMessage(jsObj) {
		let obj = {}
		jsObj = jsObj.xml
		if (typeof jsObj === 'object') {
			// 遍历对象
			for (const key in jsObj) {
				if (jsObj.hasOwnProperty(key)) {
					const data = jsObj[key]
					// 过滤空的数据
					if (Array.isArray(data) && data.length > 0) {
						obj[key] = data[0]
					}
				}
			}
		}
		return obj
	},
	// 保存文件
	writeFileAsync(data, path) {
		const { writeFile } = fs
		return new Promise((res, rej) => {
			// 对象写入文件是 [Object], 只能写入json 文件
			writeFile(path, JSON.stringify(data), err => {
				if (!err) {
					res(true)
				} else {
					rej(false)
				}
			})
		})
	},
	// 读取文件
	readFileAsync(path) {
		return new Promise((res, rej) => {
			const { readFile } = fs
			readFile(path, (err, data) => {
				if (!err) {
					// 将文本文件保存的数据转化为对象
					data = JSON.parse(data)
					res(data)
				} else {
					rej('readFileAsync 出问题')
				}
			})
		})
	}
}
