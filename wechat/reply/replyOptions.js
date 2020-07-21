/**
 * 处理用户发送的消息和内容，返回不同的配置对象
 */

// 执行MySQL语句函数
const sqlQuery = require('../../server/mysql/mysql')
// 获取服务器主机地址
const { host_url } = require('../../config/index.js')

// 这里是异步函数，外部使用的时候需要使用await
module.exports = async msg => {
	let content = '您在说什么，我还不是很清楚。 具体功能可以点击帮助获取详细信息。'
	let options = {
		ToUserName: msg.ToUserName,
		FromUserName: msg.FromUserName,
		msgType: 'text'
	}

	// 是文本信息
	if (msg.MsgType === 'text') {
		// 判断用户发送的内容具体是什么
		if (msg.Content === '2') {
			// 回复热门数据
			content = '暂时没有热门电影的数据'
			const search_result = await sqlQuery('select * from movieInfo order by rand() LIMIT 1')
			const search_arr = Array.from(search_result)
			// 如果存在数据
			if (search_arr && search_arr.length) {
				search_arr.forEach(item => {
					// 将地址重写为 开发者服务器的地址
					item.href = `${host_url}/detail/${item.movieId}`
				})
				content = search_arr
				options.msgType = 'news'
			}
		}
		// 回复预告片首页
		else if (msg.Content === '1') {
			let arr = []
			let obj = {
				movieName: '电影预告片',
				introduction: `至尊影视专题为你推荐经典美剧英剧和最新热门美剧排行前十名的榜单。
					美剧多元的表达和对艺术的不懈追求，适合假日休闲静下心来细细品味。`,
				img:
					'http://wx.qlogo.cn/mmopen/YYRjLzV1e9L0radhkaK7UKclLe4LicIwry1AU5c7hohibazRJsD1ic0HJ0Hiaz478umMs7xJzyLHpnnOr61cHEX99vEjz85hBZIY/64',
				href: `${host_url}/previewMovie`
			}
			arr.push(obj)
			content = arr
			options.msgType = 'news'
		} else if (msg.Content.match('爱')) {
			content = '我爱你❤️'
		} else {
			// // 搜索用户的指定信息
			// const word = msg.Content
			// // 定义用户的请求地址
			// const host_url = `https://search.douban.com/movie/subject_search?search_text=${word}&cat=1002`
			const word = '30170448'
			const host_url = `https://api.douban.com/v2/movie/subject/${word}?apikey=0df993c66c0c636e29ecbb5344252a4a`
		}
	}
	// 是图片信息
	else if (msg.MsgType === 'image') {
		options.msgType = 'image'
		options.media_id = msg.MediaId
	}
	// 是语音信息
	else if (msg.MsgType === 'voice') {
		options.msgType = 'voice'
		options.media_id = msg.MediaId
		console.log(msg.Recognition)
	}
	// 是事件
	else if (msg.MsgType === 'event') {
		if (msg.Event === 'subscribe') {
			// 用户订阅事件
			content = `感谢您订阅至尊影视 ~ \n    我们致力于收集优秀的影视，推荐给您。\n\n    回复 1 ：能获取预告片首页。\n\n    回复 2 ：能随机获取一部推荐的电影。\n\n    回复 3 ：根据您发送的关键字查找指定的电影详情。\n\n    回复 语音 ：根据您发送的语音能查找指定的电影详情。`
		} else if (msg.Event === 'unsubscribe') {
			// 用户取消订阅事件
			console.log('无情取关')
		} else if (msg.Event === 'CLICK') {
			// 用户点击事件
			const key1 = msg.EventKey
			if (key1 === 'help') {
				content = `您可以按照以下提示。\n\n    回复 1 ：能获取预告片首页。\n\n    回复 2 ：能获取优质热门的电影列表。\n\n    回复 3 ：根据您发送的关键字查找指定的电影详情。\n\n    回复 语音 ：根据您发送的语音能查找指定的电影详情。`
			}
		}
	}

	options.content = content

	return options
}
